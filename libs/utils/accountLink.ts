import { getJwtToken } from '../auth';
import { isNativeApp, openInSystemBrowser } from '../native';
import { redirectToTelegramAuth, startTelegramAppAuth } from './telegramAuth';

// Ulash oqimi tashqi sahifadan o'tadi — backend memberId emas, 10 daqiqalik imzolangan link token kutadi
const fetchLinkToken = async (): Promise<string> => {
	const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/link-token`, {
		method: 'POST',
		headers: { Authorization: `Bearer ${getJwtToken()}` },
	});
	const data = (await response.json()) as { linkToken?: string; message?: string };
	if (!data.linkToken) throw new Error(data.message || 'Login required');
	return data.linkToken;
};

export const startGoogleLinkFlow = async (): Promise<void> => {
	const state = encodeURIComponent(await fetchLinkToken());
	const api = process.env.REACT_APP_API_URL;
	if (isNativeApp()) {
		await openInSystemBrowser(`${api}/auth/link/google?state=${state}&client=app`);
		return;
	}
	window.location.href = `${api}/auth/link/google?state=${state}`;
};

/** Web: joriy sahifada redirect (natija MyProfile'da POST qilinadi). App: tizim brauzeri + deep link */
export const startTelegramLinkFlow = async (): Promise<void> => {
	if (!isNativeApp()) return redirectToTelegramAuth();
	await startTelegramAppAuth(await fetchLinkToken());
};
