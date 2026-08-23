import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@apollo/client';
import { useTranslation } from 'next-i18next';
import { AR_MODELS, ArModel } from '../../config/arModels';
import { GET_AR_PROPERTIES } from '../../../apollo/user/query';
import { REACT_APP_API_URL } from '../../config';
import { Direction } from '../../enums/common.enum';

/**
 * Scene Viewer (Android) / Quick Look (iOS) based AR, via <model-viewer>.
 *
 * Replaces the previous in-page WebXR implementation: WebXR renders the ARCore camera
 * feed at a low resolution that Chrome upscales, which no client-side setting can fix.
 * Scene Viewer uses the native camera pipeline and additionally works on iOS.
 */

interface ArModelViewerProps {
	/** GLB of the actual catalog product; falls back to the bundled stand-in models */
	modelUrl?: string;
	/** USDZ for iOS Quick Look — optional, iOS falls back to the 3D preview without it */
	iosModelUrl?: string;
	initialModelId?: string;
	productTitle?: string;
	posterUrl?: string;
	onClose?: () => void;
}

type ModelViewerElement = HTMLElement & { activateAR: () => Promise<void>; canActivateAR: boolean };

const MODEL_VIEWER_TAG = 'model-viewer';
const MODEL_VIEWER_SRC = '/vendor/model-viewer.min.js';
/** Catalog page size scanned for products that already have a GLB attached */
const AR_PROPERTY_LIMIT = 50;
/** Uploaded product GLBs are already baked to real-world metres, so no scale hint is needed */
const BAKED_REAL_WIDTH = 0;

interface ArPropertyRow {
	_id: string;
	propertyTitle: string;
	propertyArModel?: string;
}

const ArModelViewer = ({
	modelUrl,
	iosModelUrl,
	initialModelId,
	productTitle,
	posterUrl,
	onClose,
}: ArModelViewerProps) => {
	const { t } = useTranslation('common');
	const viewerRef = useRef<ModelViewerElement | null>(null);
	const [ready, setReady] = useState(false);
	const [arAvailable, setArAvailable] = useState(false);
	const [activeModel, setActiveModel] = useState<ArModel>(
		() => AR_MODELS.find((item) => item.id === initialModelId) ?? AR_MODELS[0],
	);

	/** Real catalog products come first in the picker; the bundled models stay as a fallback */
	const { data: arPropertiesData } = useQuery(GET_AR_PROPERTIES, {
		fetchPolicy: 'cache-first',
		variables: {
			input: { page: 1, limit: AR_PROPERTY_LIMIT, sort: 'createdAt', direction: Direction.DESC, search: {} },
		},
	});

	const pickerModels = useMemo<ArModel[]>(() => {
		const rows: ArPropertyRow[] = arPropertiesData?.getProperties?.list ?? [];
		const products = rows
			.filter((row) => Boolean(row.propertyArModel))
			.map((row) => ({
				id: row._id,
				label: row.propertyTitle,
				url: `${REACT_APP_API_URL}/${row.propertyArModel}`,
				realWidth: BAKED_REAL_WIDTH,
			}));
		return [...products, ...AR_MODELS];
	}, [arPropertiesData]);

	/**
	 * Loaded as a vendored standalone bundle rather than the npm package: model-viewer's
	 * ESM build imports from `three` and needs r16x, while this app is pinned to r150
	 * (@react-three/fiber). The dist bundle carries its own three and avoids the clash.
	 */
	useEffect(() => {
		if (customElements.get(MODEL_VIEWER_TAG)) {
			setReady(true);
			return;
		}

		const existing = document.querySelector<HTMLScriptElement>(`script[src="${MODEL_VIEWER_SRC}"]`);
		const script = existing ?? document.createElement('script');
		const onLoad = () => setReady(true);
		script.addEventListener('load', onLoad);

		if (!existing) {
			script.type = 'module';
			script.src = MODEL_VIEWER_SRC;
			document.head.appendChild(script);
		}

		return () => script.removeEventListener('load', onLoad);
	}, []);

	useEffect(() => {
		if (!ready) return;
		const viewer = viewerRef.current;
		if (!viewer) return;

		const syncArAvailability = () => setArAvailable(Boolean(viewer.canActivateAR));
		syncArAvailability();
		viewer.addEventListener('load', syncArAvailability);
		return () => viewer.removeEventListener('load', syncArAvailability);
	}, [ready]);

	const src = modelUrl ?? activeModel.url;
	const label = productTitle ?? activeModel.label;
	const showPicker = !modelUrl;

	const handleActivateAr = async () => {
		try {
			await viewerRef.current?.activateAR();
		} catch {
			// Scene Viewer refused (unsupported device / ARCore missing) — the 3D preview stays usable
			setArAvailable(false);
		}
	};

	const viewerProps = useMemo(
		() => ({
			src,
			ar: true,
			'ar-modes': 'scene-viewer webxr quick-look',
			'ar-placement': 'floor',
			// Models are baked to real-world metres, so AR opens at the right size —
			// 'auto' still lets the viewer pinch to resize when the fit is off
			'ar-scale': 'auto',
			'camera-controls': true,
			'touch-action': 'pan-y',
			'shadow-intensity': '1',
			'environment-image': 'neutral',
			exposure: '1',
			alt: label,
			...(iosModelUrl ? { 'ios-src': iosModelUrl } : {}),
			...(posterUrl ? { poster: posterUrl } : {}),
		}),
		[src, label, iosModelUrl, posterUrl],
	);

	return (
		<div className="ar-viewer">
			<div className="ar-overlay-top">
				{onClose && (
					<button type="button" className="ar-icon-button" onClick={onClose} aria-label={t('Yopish')}>
						✕
					</button>
				)}
				<span className="ar-hint">{label}</span>
			</div>

			{ready ? (
				// @ts-expect-error — <model-viewer> is a custom element without React typings
				<model-viewer ref={viewerRef} class="ar-model-viewer" {...viewerProps} />
			) : (
				<div className="ar-model-viewer ar-model-viewer--loading">{t('Yuklanmoqda')}</div>
			)}

			<div className="ar-overlay-bottom">
				{showPicker && (
					<div className="ar-model-picker">
						{pickerModels.map((model) => (
							<button
								key={model.id}
								type="button"
								className={`ar-model-chip${model.id === activeModel.id ? ' active' : ''}`}
								onClick={() => setActiveModel(model)}
							>
								{model.label}
							</button>
						))}
					</div>
				)}

				<div className="ar-button-slot">
					<button type="button" className="ar-start-button" onClick={handleActivateAr} disabled={!arAvailable}>
						{arAvailable ? t('AR bilan ko\'rish') : t('Qurilmangiz AR ni qo\'llab-quvvatlamaydi')}
					</button>
				</div>
			</div>
		</div>
	);
};

export default ArModelViewer;
