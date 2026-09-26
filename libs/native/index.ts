import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import { StatusBar, Style } from '@capacitor/status-bar';

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

// Status bar sayt temasiga mos bo'lsin (theme.scss dagi --bg-page)
const STATUS_BAR_COLORS = { light: '#ffffff', dark: '#1e1b17' } as const;

export const syncStatusBarTheme = async (mode: keyof typeof STATUS_BAR_COLORS): Promise<void> => {
	if (!isNativeApp()) return;
	try {
		// Style.Dark = och matn (qora fon uchun), Style.Light = qora matn
		await StatusBar.setStyle({ style: mode === 'dark' ? Style.Dark : Style.Light });
		await StatusBar.setBackgroundColor({ color: STATUS_BAR_COLORS[mode] });
	} catch {
		// Eski app build'ida plugin bo'lmasa — jim o'tamiz
	}
};
