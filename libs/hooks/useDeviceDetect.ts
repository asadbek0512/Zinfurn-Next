import { useEffect, useState } from 'react';

export const MOBILE_BREAKPOINT = 768;

/** Qurilmani aniqlash: haqiqiy mobil (userAgent) YOKI oyna kengligi <= 768px */
export const detectDevice = (): string => {
	if (typeof window === 'undefined') return 'desktop';
	const ua = navigator.userAgent;
	const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
	return isMobileUA || window.innerWidth <= MOBILE_BREAKPOINT ? 'mobile' : 'desktop';
};

const useDeviceDetect = (): string => {
	// SSR/birinchi render: 'desktop' (hydration mos kelishi uchun), keyin mount + resize'da yangilanadi (jonli almashish)
	const [device, setDevice] = useState('desktop');

	useEffect(() => {
		const update = () => {
			const next = detectDevice();
			setDevice((prev) => (prev !== next ? next : prev));
		};
		update(); // dastlabki aniqlash
		window.addEventListener('resize', update);
		return () => window.removeEventListener('resize', update);
	}, []);

	return device;
};

export default useDeviceDetect;
