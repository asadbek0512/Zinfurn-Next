import { useEffect, useState } from 'react';

/**
 * Sayt Capacitor app (WebView) ichida ochilganmi.
 * Belgini _document.tsx dagi pre-paint script qo'yadi (UA tag: ZinfurnApp).
 * SSR'da har doim false — app'ga xos UI faqat client'da render qilinadi.
 */
export const isAppMode = (): boolean => {
	if (typeof document === 'undefined') return false;
	return document.documentElement.dataset.app === '1';
};

const useAppMode = (): boolean => {
	const [appMode, setAppMode] = useState(false);
	useEffect(() => setAppMode(isAppMode()), []);
	return appMode;
};

export default useAppMode;
