import { Capacitor, PluginListenerHandle, registerPlugin } from '@capacitor/core';
import { isNativeApp } from './index';

type PermissionState = 'prompt' | 'prompt-with-rationale' | 'granted' | 'denied';

interface PushNotificationsPlugin {
	checkPermissions(): Promise<{ receive: PermissionState }>;
	requestPermissions(): Promise<{ receive: PermissionState }>;
	register(): Promise<void>;
	createChannel(channel: { id: string; name: string; importance: number }): Promise<void>;
	addListener(event: 'registration', cb: (token: { value: string }) => void): Promise<PluginListenerHandle>;
	addListener(event: 'registrationError', cb: (err: { error: string }) => void): Promise<PluginListenerHandle>;
	addListener(
		event: 'pushNotificationActionPerformed',
		cb: (action: { notification: { data?: Record<string, string> } }) => void,
	): Promise<PluginListenerHandle>;
}

const PUSH_PLUGIN = 'PushNotifications';
const PushNotifications = registerPlugin<PushNotificationsPlugin>(PUSH_PLUGIN);
export const PUSH_TOKEN_KEY = 'zinfurn_push_token';
/** Backend FCM xabarlari shu kanalga keladi (Android 8+) */
const ANDROID_CHANNEL_ID = 'default';
const ANDROID_IMPORTANCE_HIGH = 4;

export type PushPlatform = 'IOS' | 'ANDROID';

/**
 * Push faqat kalitlar sozlangan platformada yoqiladi: Android — google-services.json bilan
 * build qilingan app (aks holda register() crash beradi), iOS — pullik Apple akkaunt + APNs key.
 */
export const isPushEnabled = (): boolean => {
	if (!isNativeApp() || !Capacitor.isPluginAvailable(PUSH_PLUGIN)) return false;
	const platform = Capacitor.getPlatform();
	if (platform === 'ios') return process.env.NEXT_PUBLIC_PUSH_IOS === 'true';
	if (platform === 'android') return process.env.NEXT_PUBLIC_PUSH_ANDROID === 'true';
	return false;
};

export const pushPlatform = (): PushPlatform => (Capacitor.getPlatform() === 'ios' ? 'IOS' : 'ANDROID');

/** Ruxsat so'raydi va qurilmani ro'yxatdan o'tkazadi; token `onToken` ga keladi */
export const setupPush = async (
	onToken: (token: string) => void,
	onOpen: (url: string) => void,
): Promise<() => void> => {
	const handles = await Promise.all([
		PushNotifications.addListener('registration', ({ value }) => {
			try {
				localStorage.setItem(PUSH_TOKEN_KEY, value);
			} catch {
				// storage yopiq — token baribir serverga ketadi
			}
			onToken(value);
		}),
		PushNotifications.addListener('registrationError', ({ error }) => console.error('push registration failed', error)),
		PushNotifications.addListener('pushNotificationActionPerformed', ({ notification }) => {
			const url = notification.data?.url;
			if (url && url.startsWith('/')) onOpen(url);
		}),
	]);
	const cleanup = () => handles.forEach((h) => h.remove());

	let { receive } = await PushNotifications.checkPermissions();
	if (receive === 'prompt' || receive === 'prompt-with-rationale') ({ receive } = await PushNotifications.requestPermissions());
	if (receive !== 'granted') return cleanup;

	if (Capacitor.getPlatform() === 'android') {
		await PushNotifications.createChannel({ id: ANDROID_CHANNEL_ID, name: 'Zinfurn', importance: ANDROID_IMPORTANCE_HIGH });
	}
	await PushNotifications.register();
	return cleanup;
};

/** Logout: token boshqa user'ga push olmasligi uchun serverdan o'chiriladi */
export const unregisterPushToken = async (): Promise<void> => {
	let token: string | null = null;
	try {
		token = localStorage.getItem(PUSH_TOKEN_KEY);
		localStorage.removeItem(PUSH_TOKEN_KEY);
	} catch {
		return;
	}
	if (!token) return;
	await fetch(`${process.env.REACT_APP_API_GRAPHQL_URL}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			query: 'mutation UnregisterPushToken($pushToken: String!) { unregisterPushToken(pushToken: $pushToken) }',
			variables: { pushToken: token },
		}),
	});
};
