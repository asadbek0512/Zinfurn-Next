import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import ViewInArIcon from '@mui/icons-material/ViewInAr';

/**
 * Opens Scene Viewer / Quick Look straight from the product page.
 *
 * The <model-viewer> element is kept off-screen and only used as the AR launcher:
 * `activateAR()` has to run inside a user gesture, so the button calls it directly
 * instead of routing through /ar-view first. Devices without AR (desktop, older
 * phones) fall back to the /ar-view 3D preview.
 */

interface ArLaunchButtonProps {
	/** GLB of this product; without it the viewer falls back to the bundled stand-ins */
	modelUrl?: string;
	title: string;
	category?: string;
	posterUrl?: string;
	/** Extra class so the button can adopt the look of the surface it sits on */
	className?: string;
}

type ModelViewerElement = HTMLElement & { activateAR: () => Promise<void>; canActivateAR: boolean };

const MODEL_VIEWER_TAG = 'model-viewer';
const MODEL_VIEWER_SRC = '/vendor/model-viewer.min.js';
/** "3D yo'q" yozuvi ekranda turadigan vaqt — availability.scss dagi animatsiya bilan bir xil */
const MISSING_TOAST_MS = 2400;

const ArLaunchButton = ({ modelUrl, title, category, posterUrl, className }: ArLaunchButtonProps) => {
	const router = useRouter();
	const { t } = useTranslation('common');
	const viewerRef = useRef<ModelViewerElement | null>(null);
	const [ready, setReady] = useState(false);
	const [launching, setLaunching] = useState(false);
	const [showMissing, setShowMissing] = useState(false);
	const missingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

	const hasModel = Boolean(modelUrl);

	useEffect(() => {
		return () => {
			if (missingTimer.current) clearTimeout(missingTimer.current);
		};
	}, []);

	useEffect(() => {
		if (!modelUrl) return;
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
	}, [modelUrl]);

	const openPreviewPage = () => {
		router.push({
			pathname: '/ar-view',
			query: {
				title,
				...(category ? { category } : {}),
				...(modelUrl ? { src: modelUrl } : {}),
				...(posterUrl ? { poster: posterUrl } : {}),
			},
		});
	};

	const handleClick = async () => {
		// 3D modeli yo'q mahsulot — AR ochilmaydi, faqat qisqa yozuv chiqib yo'qoladi
		if (!hasModel) {
			if (missingTimer.current) clearTimeout(missingTimer.current);
			setShowMissing(true);
			missingTimer.current = setTimeout(() => setShowMissing(false), MISSING_TOAST_MS);
			return;
		}

		const viewer = viewerRef.current;
		if (!viewer?.canActivateAR) {
			openPreviewPage();
			return;
		}

		setLaunching(true);
		try {
			await viewer.activateAR();
		} catch {
			// Scene Viewer refused (ARCore missing / unsupported) — the 3D preview still works
			openPreviewPage();
		} finally {
			setLaunching(false);
		}
	};

	return (
		<div className="arLaunchBtn-wrap">
			{showMissing && <span className="arMissingToast">{t('ar_model_missing')}</span>}

			<button
				type="button"
				className={[
					'arLaunchBtn',
					className,
					hasModel ? '' : 'is-unavailable',
				]
					.filter(Boolean)
					.join(' ')}
				onClick={handleClick}
				disabled={launching}
				aria-disabled={!hasModel}
			>
				<ViewInArIcon className="arLaunchBtn__icon" />
				<span className="arLaunchBtn__text">
					<strong>{t("AR bilan ko'rish")}</strong>
					<small>{hasModel ? t("Xonangizda sinab ko'ring") : t('ar_model_missing')}</small>
				</span>
			</button>

			{ready && modelUrl && (
				// @ts-expect-error — <model-viewer> is a custom element without React typings
				<model-viewer
					ref={viewerRef}
					class="arLaunchBtn__viewer"
					src={modelUrl}
					ar
					ar-modes="scene-viewer webxr quick-look"
					ar-placement="floor"
					ar-scale="auto"
					alt={title}
					{...(posterUrl ? { poster: posterUrl } : {})}
				/>
			)}
		</div>
	);
};

export default ArLaunchButton;
