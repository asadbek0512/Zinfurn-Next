import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';

// Capacitor app zinfurn.uz ni WebView ichida ochadi. Google embedded WebView'da
// OAuth'ni bloklaydi (disallowed_useragent), shuning uchun app'da OAuth tizim
// brauzerida (Custom Tabs / SFSafariViewController) ochiladi va natija
// APP_DEEP_LINK custom scheme orqali app'ga qaytadi.
export const isNativeApp = (): boolean => {
	if (typeof window === 'undefined') return false;
	return Capacitor.isNativePlatform();
};

export const openInSystemBrowser = async (url: string): Promise<void> => {
	await Browser.open({ url, presentationStyle: 'popover' });
};

export const closeSystemBrowser = async (): Promise<void> => {
	try {
		await Browser.close();
	} catch {
		// iOS'da foydalanuvchi o'zi yopgan bo'lsa xato beradi — ahamiyatsiz
	}
};

export const startGoogleAuth = async (): Promise<void> => {
	const api = process.env.REACT_APP_API_URL;
	if (isNativeApp()) {
		await openInSystemBrowser(`${api}/auth/app/google`);
		return;
	}
	window.location.href = `${api}/auth/google`;
};

export const startGoogleLink = async (memberId: string): Promise<void> => {
	const api = process.env.REACT_APP_API_URL;
	if (isNativeApp()) {
		await openInSystemBrowser(`${api}/auth/link/google?state=${memberId}&client=app`);
		return;
	}
	window.location.href = `${api}/auth/link/google?state=${memberId}`;
};
