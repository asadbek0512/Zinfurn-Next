import { useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { XREstimatedLight } from 'three/examples/jsm/webxr/XREstimatedLight';
import { useTranslation } from 'next-i18next';
import { AR_MODELS, ArModel } from '../../config/arModels';

const MAX_PIXEL_RATIO = 2;
const RETICLE_INNER_RADIUS = 0.15;
const RETICLE_OUTER_RADIUS = 0.2;
const ROTATION_STEP = Math.PI / 8;
const CAMERA_FOV = 70;
const CAMERA_NEAR = 0.01;
const CAMERA_FAR = 20;
const AR_SESSION_MODE = 'immersive-ar';

type ArSupport = 'checking' | 'supported' | 'unsupported';

interface ArViewerProps {
	models?: ArModel[];
	initialModelId?: string;
	onClose?: () => void;
}

/**
 * WebXR furniture placement (Android Chrome).
 * Based on the approach in cynthiachiu/3D-WebXR-Furniture (MIT), rewritten for
 * Next.js: typed, lifecycle-safe, lazy model loading and real-world auto-scaling.
 */
const ArViewer = ({ models = AR_MODELS, initialModelId, onClose }: ArViewerProps) => {
	const { t } = useTranslation('common');

	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const overlayRef = useRef<HTMLDivElement | null>(null);

	const sceneRef = useRef<THREE.Scene | null>(null);
	const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
	const reticleRef = useRef<THREE.Mesh | null>(null);
	const surfaceRef = useRef(false);
	const placedRef = useRef<THREE.Object3D[]>([]);
	const modelCacheRef = useRef<Map<string, THREE.Group>>(new Map());
	const activeModelRef = useRef<ArModel>(models.find((m) => m.id === initialModelId) ?? models[0]);

	const [support, setSupport] = useState<ArSupport>('checking');
	const [activeModelId, setActiveModelId] = useState<string>(activeModelRef.current.id);
	const [loadingModelId, setLoadingModelId] = useState<string | null>(null);
	const [placedCount, setPlacedCount] = useState(0);
	const [inSession, setInSession] = useState(false);
	const [surfaceFound, setSurfaceFound] = useState(false);
	const [diag, setDiag] = useState('init');
	const [loadError, setLoadError] = useState<string | null>(null);
	const [startError, setStartError] = useState<string | null>(null);
	const [starting, setStarting] = useState(false);
	const hitsRef = useRef(0);
	const hitSourceReadyRef = useRef<string>('no');

	/** Scales a freshly loaded GLB to its real-world width and rests it on the floor. */
	const normalizeModel = useCallback((group: THREE.Group, realWidth: number) => {
		const box = new THREE.Box3().setFromObject(group);
		const size = box.getSize(new THREE.Vector3());
		const footprint = Math.max(size.x, size.z) || 1;
		const scale = realWidth / footprint;

		group.scale.setScalar(scale);

		const scaledBox = new THREE.Box3().setFromObject(group);
		group.position.y -= scaledBox.min.y;

		return group;
	}, []);

	const loadModel = useCallback(
		async (model: ArModel): Promise<THREE.Group> => {
			const cached = modelCacheRef.current.get(model.id);
			if (cached) return cached;

			setLoadingModelId(model.id);
			try {
				const loader = new GLTFLoader();
				const gltf = await loader.loadAsync(model.url);
				const normalized = normalizeModel(gltf.scene, model.realWidth);
				modelCacheRef.current.set(model.id, normalized);
				setLoadError(null);
				return normalized;
			} catch (error) {
				// Surfaced on screen — a silent failure here looks identical to "AR is broken"
				setLoadError(`${model.id}: ${(error as Error)?.message ?? 'load failed'}`);
				throw error;
			} finally {
				setLoadingModelId(null);
			}
		},
		[normalizeModel],
	);

	const handleSelectModel = useCallback(
		async (model: ArModel) => {
			activeModelRef.current = model;
			setActiveModelId(model.id);
			await loadModel(model).catch(() => undefined);
		},
		[loadModel],
	);

	const handleUndo = useCallback(() => {
		const last = placedRef.current.pop();
		if (last && sceneRef.current) {
			sceneRef.current.remove(last);
			setPlacedCount(placedRef.current.length);
		}
	}, []);

	const handleClear = useCallback(() => {
		const scene = sceneRef.current;
		if (!scene) return;
		placedRef.current.forEach((item) => scene.remove(item));
		placedRef.current = [];
		setPlacedCount(0);
	}, []);

	/**
	 * Requests the XR session directly instead of using three's ARButton, which
	 * swallows the rejection and only disables itself — indistinguishable from a dead button.
	 */
	const handleStartAr = useCallback(async () => {
		const renderer = rendererRef.current;
		const overlay = overlayRef.current;
		const xr = (navigator as Navigator & { xr?: XRSystem }).xr;
		if (!renderer || !overlay || !xr) return;

		setStartError(null);
		setStarting(true);
		try {
			const session = await xr.requestSession(AR_SESSION_MODE, {
				requiredFeatures: ['hit-test'],
				optionalFeatures: ['dom-overlay', 'light-estimation'],
				domOverlay: { root: overlay },
			} as XRSessionInit);
			await renderer.xr.setSession(session);
		} catch (error) {
			const err = error as Error;
			setStartError(`${err?.name ?? 'Error'}: ${err?.message ?? 'requestSession failed'}`);
		} finally {
			setStarting(false);
		}
	}, []);

	const handleRotate = useCallback(() => {
		const last = placedRef.current[placedRef.current.length - 1];
		if (last) last.rotateY(ROTATION_STEP);
	}, []);

	// AR capability probe — runs before we spin up any WebGL context
	useEffect(() => {
		let cancelled = false;
		const xr = (navigator as Navigator & { xr?: XRSystem }).xr;

		if (!xr?.isSessionSupported) {
			setSupport('unsupported');
			return;
		}

		xr.isSessionSupported('immersive-ar')
			.then((ok) => {
				if (!cancelled) setSupport(ok ? 'supported' : 'unsupported');
			})
			.catch(() => {
				if (!cancelled) setSupport('unsupported');
			});

		return () => {
			cancelled = true;
		};
	}, []);

	useEffect(() => {
		if (support !== 'supported') return;

		const canvas = canvasRef.current;
		const overlay = overlayRef.current;
		if (!canvas || !overlay) return;

		const scene = new THREE.Scene();
		sceneRef.current = scene;

		const camera = new THREE.PerspectiveCamera(
			CAMERA_FOV,
			window.innerWidth / window.innerHeight,
			CAMERA_NEAR,
			CAMERA_FAR,
		);

		const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO));
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setClearColor(0x000000, 0); // camera passthrough must show through
		renderer.xr.enabled = true;
		// three defaults to 'local-floor', which immersive-ar only grants if requested as a
		// feature — 'local' is always available and is enough since we place on hit-test poses.
		renderer.xr.setReferenceSpaceType('local');
		rendererRef.current = renderer;

		const ambientLight = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
		ambientLight.position.set(0.5, 1, 0.25);
		scene.add(ambientLight);

		// Real-world light estimation replaces our fallback light once the session provides it
		const xrLight = new XREstimatedLight(renderer);
		const onEstimationStart = () => {
			scene.add(xrLight);
			scene.remove(ambientLight);
			if (xrLight.environment) scene.environment = xrLight.environment;
		};
		const onEstimationEnd = () => {
			scene.add(ambientLight);
			scene.remove(xrLight);
			scene.environment = null;
		};
		xrLight.addEventListener('estimationstart', onEstimationStart);
		xrLight.addEventListener('estimationend', onEstimationEnd);

		const reticle = new THREE.Mesh(
			new THREE.RingGeometry(RETICLE_INNER_RADIUS, RETICLE_OUTER_RADIUS, 32).rotateX(-Math.PI / 2),
			new THREE.MeshBasicMaterial({ color: 0xffb072, side: THREE.DoubleSide, transparent: true, opacity: 0.9 }),
		);
		reticle.matrixAutoUpdate = false;
		reticle.visible = false;
		scene.add(reticle);
		reticleRef.current = reticle;

		const onSelect = () => {
			if (!reticle.visible) return;
			const source = modelCacheRef.current.get(activeModelRef.current.id);
			if (!source) {
				// Not in cache yet (slow network / model just switched) — fetch it so the next tap lands
				loadModel(activeModelRef.current).catch(() => undefined);
				return;
			}

			const placed = source.clone(true);
			const position = new THREE.Vector3();
			const quaternion = new THREE.Quaternion();
			const scale = new THREE.Vector3();
			reticle.matrix.decompose(position, quaternion, scale);

			placed.position.copy(position);
			placed.quaternion.copy(quaternion);
			placed.scale.copy(source.scale);
			placed.position.y += source.position.y;

			scene.add(placed);
			placedRef.current.push(placed);
			setPlacedCount(placedRef.current.length);
		};

		const controller = renderer.xr.getController(0);
		controller.addEventListener('select', onSelect);
		scene.add(controller);

		// Tapping overlay UI must not also fire an XR `select` (i.e. place furniture)
		const onBeforeXrSelect = (event: Event) => {
			if ((event.target as HTMLElement | null)?.closest('button')) event.preventDefault();
		};
		overlay.addEventListener('beforexrselect', onBeforeXrSelect);

		const onSessionStart = () => setInSession(true);
		const onSessionEnd = () => {
			setInSession(false);
			surfaceRef.current = false;
			setSurfaceFound(false);
			handleClear();
		};
		renderer.xr.addEventListener('sessionstart', onSessionStart);
		renderer.xr.addEventListener('sessionend', onSessionEnd);

		const onResize = () => {
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
			renderer.setSize(window.innerWidth, window.innerHeight);
		};
		window.addEventListener('resize', onResize);

		let hitTestSource: XRHitTestSource | null = null;
		let hitTestRequested = false;

		renderer.setAnimationLoop((_timestamp, frame) => {
			if (frame) {
				const referenceSpace = renderer.xr.getReferenceSpace();
				const session = renderer.xr.getSession();

				if (!hitTestRequested && session) {
					hitTestRequested = true;
					session
						.requestReferenceSpace('viewer')
						.then((viewerSpace) => session.requestHitTestSource?.({ space: viewerSpace }))
						.then((source) => {
							hitTestSource = source ?? null;
							hitSourceReadyRef.current = source ? 'yes' : 'null';
						})
						.catch((error: Error) => {
							hitTestSource = null;
							hitSourceReadyRef.current = `err:${error?.message ?? '?'}`;
						});

					session.addEventListener('end', () => {
						hitTestRequested = false;
						hitTestSource = null;
					});
				}

				if (hitTestSource && referenceSpace) {
					const hits = frame.getHitTestResults(hitTestSource);
					hitsRef.current = hits.length;
					if (hits.length) {
						const pose = hits[0].getPose(referenceSpace);
						if (pose) {
							reticle.visible = true;
							reticle.matrix.fromArray(pose.transform.matrix);
						}
					} else {
						reticle.visible = false;
					}

					// Drives the hint text; only re-render when the state actually flips
					if (reticle.visible !== surfaceRef.current) {
						surfaceRef.current = reticle.visible;
						setSurfaceFound(reticle.visible);
					}
				}
			}

			renderer.render(scene, camera);
		});

		// Cheap on-device readout — polled instead of set per frame
		const diagTimer = window.setInterval(() => {
			setDiag(
				[
					`ses:${renderer.xr.getSession() ? 'on' : 'off'}`,
					`ref:${renderer.xr.getReferenceSpace() ? 'ok' : '-'}`,
					`src:${hitSourceReadyRef.current}`,
					`hits:${hitsRef.current}`,
					`cache:${modelCacheRef.current.size}`,
				].join(' '),
			);
		}, 500);

		return () => {
			window.clearInterval(diagTimer);
			renderer.setAnimationLoop(null);
			window.removeEventListener('resize', onResize);
			overlay.removeEventListener('beforexrselect', onBeforeXrSelect);
			controller.removeEventListener('select', onSelect);
			xrLight.removeEventListener('estimationstart', onEstimationStart);
			xrLight.removeEventListener('estimationend', onEstimationEnd);
			renderer.xr.removeEventListener('sessionstart', onSessionStart);
			renderer.xr.removeEventListener('sessionend', onSessionEnd);
			renderer.xr.getSession()?.end().catch(() => undefined);
			hitTestSource = null;

			scene.traverse((object) => {
				const mesh = object as THREE.Mesh;
				if (!mesh.isMesh) return;
				mesh.geometry?.dispose();
				const material = mesh.material;
				if (Array.isArray(material)) material.forEach((entry) => entry.dispose());
				else material?.dispose();
			});
			scene.clear();
			renderer.dispose();

			modelCacheRef.current.clear();
			placedRef.current = [];
			sceneRef.current = null;
			rendererRef.current = null;
			reticleRef.current = null;
		};
	}, [support, handleClear, loadModel]);

	// Warm up the initially selected model so the first tap places instantly
	useEffect(() => {
		if (support !== 'supported') return;
		loadModel(activeModelRef.current).catch(() => undefined);
	}, [support, loadModel]);

	if (support === 'checking') {
		return (
			<div className="ar-viewer ar-viewer--message">
				<p>{t('AR qo\'llab-quvvatlanishi tekshirilmoqda')}</p>
			</div>
		);
	}

	if (support === 'unsupported') {
		return (
			<div className="ar-viewer ar-viewer--message">
				<h3>{t('Qurilmangiz AR ni qo\'llab-quvvatlamaydi')}</h3>
				<p>{t('AR hozircha Android telefonlarda Chrome brauzeri orqali ishlaydi')}</p>
				{onClose && (
					<button type="button" className="ar-secondary-button" onClick={onClose}>
						{t('Orqaga')}
					</button>
				)}
			</div>
		);
	}

	return (
		<div className={`ar-viewer${inSession ? ' ar-viewer--session' : ''}`}>
			<canvas ref={canvasRef} className="ar-canvas" />

			<div ref={overlayRef} className="ar-overlay">
				<div className="ar-overlay-top">
					{onClose && (
						<button type="button" className="ar-icon-button" onClick={onClose} aria-label={t('Yopish')}>
							✕
						</button>
					)}
					{inSession && (
						<span className={`ar-hint${surfaceFound ? ' ar-hint--ready' : ''}`}>
							{surfaceFound
								? t('Yerga qarating va joylashtirish uchun bosing')
								: t('Telefonni sekin yuriting — yer izlanmoqda')}
						</span>
					)}
				</div>

				<div className="ar-diag">
					<span>{diag}</span>
					{loadError && <span className="ar-diag-error">{loadError}</span>}
					{startError && <span className="ar-diag-error">{startError}</span>}
				</div>

				<div className="ar-overlay-bottom">
					<div className="ar-model-picker">
						{models.map((model) => (
							<button
								key={model.id}
								type="button"
								className={`ar-model-chip ${activeModelId === model.id ? 'active' : ''}`}
								onClick={() => handleSelectModel(model)}
								disabled={loadingModelId === model.id}
							>
								{loadingModelId === model.id ? t('Yuklanmoqda') : model.label}
							</button>
						))}
					</div>

					{inSession && placedCount > 0 && (
						<div className="ar-actions">
							<button type="button" className="ar-secondary-button" onClick={handleRotate}>
								{t('Burish')}
							</button>
							<button type="button" className="ar-secondary-button" onClick={handleUndo}>
								{t('Orqaga qaytarish')}
							</button>
							<button type="button" className="ar-secondary-button" onClick={handleClear}>
								{t('Tozalash')}
							</button>
						</div>
					)}

					{!inSession && (
						<div className="ar-button-slot">
							<button
								type="button"
								className="ar-start-button"
								onClick={handleStartAr}
								disabled={starting}
							>
								{starting ? t('Yuklanmoqda') : 'START AR'}
							</button>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default ArViewer;
