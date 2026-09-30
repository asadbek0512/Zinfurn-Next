import { useEffect } from 'react';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { hideSplash } from '../../native';

/** _document'dagi app yuklanish qoplamasi (#app-boot-loader) va uning fade vaqti */
const BOOT_LOADER_ID = 'app-boot-loader';
const BOOT_LOADER_FADE_MS = 200;

const dismissBootLoader = () => {
	const loader = document.getElementById(BOOT_LOADER_ID);
	if (!loader) return;
	loader.classList.add('is-done');
	setTimeout(() => loader.remove(), BOOT_LOADER_FADE_MS);
};

/**
 * SSR sahifani desktop ko'rinishida beradi, mobilga hydration'dan keyin o'tadi.
 * App'da splash va yuklanish qoplamasi shu paytgacha turadi — foydalanuvchi desktop
 * "sakrashini" ko'rmaydi (sahifa qayta yuklanganda ham: login/logout, pull-to-refresh).
 */
const AppSplashGate = () => {
	const device = useDeviceDetect();

	useEffect(() => {
		if (device !== 'mobile') return;
		// Mobil DOM ekranga chizilishini kutamiz (2 frame), keyin splash va qoplama yopiladi
		requestAnimationFrame(() =>
			requestAnimationFrame(() => {
				dismissBootLoader();
				void hideSplash();
			}),
		);
	}, [device]);

	return null;
};

export default AppSplashGate;
