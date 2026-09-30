import { useEffect } from 'react';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { hideSplash } from '../../native';

/** _document'dagi app yuklanish qoplamasi (#app-boot-loader) va uning fade vaqti */
const BOOT_LOADER_ID = 'app-boot-loader';
const BOOT_LOADER_FADE_MS = 250;
/** Sahifa (rasmlar bilan) to'liq yuklanishini ko'pi bilan shuncha kutamiz — sekin internetda osilib qolmasin */
// Sahifa ochila boshlaganidan (navigation start) hisoblanadi
const PAGE_LOAD_MAX_WAIT_MS = 3000;

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
		const timer = setTimeout(resolve, Math.max(0, PAGE_LOAD_MAX_WAIT_MS - performance.now()));
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
