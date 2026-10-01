// App WebView'da Telegram widget popup'i (window.open) ochilmaydi — o'rniga redirect oqimi
const TELEGRAM_BOT_ID = '8693491156';
const TELEGRAM_OAUTH_URL = 'https://oauth.telegram.org/auth';
const TELEGRAM_RESULT_HASH = '#tgAuthResult=';

export type TelegramAuthData = Record<string, string | number>;

const decodeTelegramResult = (encoded: string): TelegramAuthData => {
	const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
	const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
	return JSON.parse(decodeURIComponent(escape(window.atob(padded))));
};

/** Telegram oauth sahifasiga o'tadi; natija joriy sahifaga #tgAuthResult bilan qaytadi */
export const redirectToTelegramAuth = () => {
	const { origin, pathname, search } = window.location;
	const params = new URLSearchParams({
		bot_id: TELEGRAM_BOT_ID,
		origin,
		request_access: 'write',
		return_to: `${origin}${pathname}${search}`,
	});
	window.location.href = `${TELEGRAM_OAUTH_URL}?${params.toString()}`;
};

/** Redirect oqimidan qaytilgan bo'lsa natijani oladi va hash'ni URL'dan tozalaydi. Yo'q bo'lsa null */
export const consumeTelegramRedirectResult = (): TelegramAuthData | null => {
	const { hash, pathname, search } = window.location;
	if (!hash.startsWith(TELEGRAM_RESULT_HASH)) return null;
	window.history.replaceState(window.history.state, '', pathname + search);
	return decodeTelegramResult(hash.slice(TELEGRAM_RESULT_HASH.length));
};

export const TELEGRAM_APP_BRIDGE_PATH = '/auth/telegram-app';

/** Mobil app: oauth tizim brauzerida ochiladi (WebView'da Telegram "Cancel" tugmasi ishlamaydi).
 *  Natija bridge sahifasiga qaytadi, u backend orqali app'ga deep link bilan yuboradi */
export const startTelegramAppAuth = async (): Promise<void> => {
	const { origin } = window.location;
	const params = new URLSearchParams({
		bot_id: TELEGRAM_BOT_ID,
		origin,
		request_access: 'write',
		return_to: `${origin}${TELEGRAM_APP_BRIDGE_PATH}`,
	});
	const { openInSystemBrowser } = await import('../native');
	await openInSystemBrowser(`${TELEGRAM_OAUTH_URL}?${params.toString()}`);
};
