import { useEffect } from 'react';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { hideSplash } from '../../native';

/**
 * SSR sahifani desktop ko'rinishida beradi, mobilga hydration'dan keyin o'tadi.
 * App'da splash shu paytgacha turadi — foydalanuvchi desktop "sakrashini" ko'rmaydi.
 */
const AppSplashGate = () => {
	const device = useDeviceDetect();

	useEffect(() => {
		if (device !== 'mobile') return;
		// Mobil DOM ekranga chizilishini kutamiz (2 frame), keyin splash yopiladi
		requestAnimationFrame(() => requestAnimationFrame(() => void hideSplash()));
	}, [device]);

	return null;
};

export default AppSplashGate;
