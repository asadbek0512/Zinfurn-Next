const SW_URL = '/sw.js';
const CLEAR_USER_CACHE = 'CLEAR_USER_CACHE';

/** Offline kesh uchun service worker (faqat production — dev'da HMR bilan to'qnashadi) */
export const registerServiceWorker = async (): Promise<void> => {
	if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) return;
	try {
		await navigator.serviceWorker.register(SW_URL);
	} catch (err) {
		console.error('service worker registration failed', err);
	}
};

/** Logout'da oldingi user'ning keshlangan GraphQL javoblarini o'chiradi */
export const clearUserCache = (): void => {
	if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
	navigator.serviceWorker.controller?.postMessage({ type: CLEAR_USER_CACHE });
};
