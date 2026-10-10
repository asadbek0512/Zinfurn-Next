import { useEffect } from 'react';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { hideSplash } from '../../native';
import { isPromoMounted, waitForPromoReady } from '../../utils/promoReady';

/** _document'dagi app yuklanish qoplamasi (#app-boot-loader) va uning fade vaqti */
const BOOT_LOADER_ID = 'app-boot-loader';
const BOOT_LOADER_FADE_MS = 250;
/** Sahifa (rasmlar bilan) to'liq yuklanishini ko'pi bilan shuncha kutamiz — sekin internetda osilib qolmasin */
// Sahifa ochila boshlaganidan (navigation start) hisoblanadi
const PAGE_LOAD_MAX_WAIT_MS = 8000;
const CSS_URL_PATTERN = /url\(["']?([^"')]+)["']?\)/g;

const dismissBootLoader = () => {
	const loader = document.getElementById(BOOT_LOADER_ID);
	if (!loader) return;
	loader.classList.add('is-done');
	setTimeout(() => loader.remove(), BOOT_LOADER_FADE_MS);
};

/** window 'load' (hamma rasm/resurs) yoki yuqori chegara — qaysi biri oldin bo'lsa */
const waitForPageLoad = async (): Promise<void> => {
	if (document.readyState === 'complete') return;
	await new Promise<void>((resolve) => {
		const timer = setTimeout(resolve, remainingWaitMs());
		window.addEventListener(
			'load',
			() => {
				clearTimeout(timer);
				resolve();
			},
			{ once: true },
		);
	});
};

const remainingWaitMs = () => Math.max(0, PAGE_LOAD_MAX_WAIT_MS - performance.now());

const isInViewport = (el: Element) => {
	const rect = el.getBoundingClientRect();
	return rect.bottom > 0 && rect.top < window.innerHeight && rect.width > 0 && rect.height > 0;
};

const waitForImage = async (img: HTMLImageElement): Promise<void> => {
	if (img.complete) return;
	await new Promise<void>((resolve) => {
		img.addEventListener('load', () => resolve(), { once: true });
		img.addEventListener('error', () => resolve(), { once: true });
	});
};

/** Ekranda ko'rinadigan rasmlar (<img> va CSS fon rasmlari) yuklanguncha — foydalanuvchi bo'sh kartalarni ko'rmasin */
const waitForVisibleImages = async (): Promise<void> => {
	const pending: Promise<void>[] = [];
	document.querySelectorAll('body *').forEach((el) => {
		if (el.closest(`#${BOOT_LOADER_ID}`) || !isInViewport(el)) return;
		if (el instanceof HTMLImageElement) {
			if (el.loading === 'lazy') el.loading = 'eager';
			pending.push(waitForImage(el));
			return;
		}
		const bg = getComputedStyle(el).backgroundImage;
		if (!bg || bg === 'none') return;
		Array.from(bg.matchAll(CSS_URL_PATTERN)).forEach(([, src]) => {
			const img = new Image();
			img.src = src;
			pending.push(waitForImage(img));
		});
	});
	await Promise.race([
		Promise.all(pending),
		new Promise<void>((resolve) => setTimeout(resolve, remainingWaitMs())),
	]);
};

const nextPaint = async (): Promise<void> => {
	await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
};

/**
 * SSR sahifani desktop ko'rinishida beradi, mobilga hydration'dan keyin o'tadi.
 * App'da web'dagi kabi to'liq sahifa loader'i turadi: mobil layout chizilib, sahifa yuklanguncha.
 * Native splash mobil layout chizilgach yopiladi (mount paytida yopilsa iOS uni qayta ko'rsatadi),
 * undan keyin foydalanuvchi shu loader'ni ko'radi.
 */
const AppSplashGate = () => {
	const device = useDeviceDetect();

	useEffect(() => {
		if (device !== 'mobile') return;
		let cancelled = false;
		const reveal = async () => {
			await nextPaint();
			void hideSplash();
			await waitForPageLoad();
			// Flash sale popup ham tayyor bo'lsin — home page va popup birdan ko'rinadi.
			// 'load'gacha hamma effect'lar ishlagan bo'ladi: popup'i yo'q sahifa (detail, 404) 8s kutmaydi
			if (isPromoMounted()) await waitForPromoReady(remainingWaitMs());
			await nextPaint();
			await waitForVisibleImages();
			await nextPaint();
			if (cancelled) return;
			dismissBootLoader();
			// launchShowDuration tugamay turib yopilgan splash qayta chiqib qolmasin
			void hideSplash();
		};
		void reveal();
		return () => {
			cancelled = true;
		};
	}, [device]);

	return null;
};

export default AppSplashGate;
