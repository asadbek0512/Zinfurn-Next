import type { NextApiRequest, NextApiResponse } from 'next';
import { ANDROID_APK_URL, APP_QR_SOURCE, APP_SECTION_ID } from '../../libs/config/appDownload';

const ANDROID_UA = /Android/i;

const GQL_URL = process.env.REACT_APP_API_GRAPHQL_URL || 'http://localhost:3007/graphql';
/** Hisoblagich sekin bo'lsa ham yuklab olish kutib qolmasin */
const RECORD_TIMEOUT_MS = 2000;
const RECORD_MUTATION = 'mutation { recordAppDownload(platform: ANDROID) }';

/** Android APK yuklab olinganini sanaydi va faylga redirect qiladi (QR ham shu yerga qaraydi) */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	// QR'ni iPhone/boshqa qurilma skanerlasa APK foydasiz — about'dagi yo'riqnomaga yuboriladi
	if (req.query.src === APP_QR_SOURCE && !ANDROID_UA.test(req.headers['user-agent'] ?? '')) {
		res.setHeader('Cache-Control', 'no-store');
		res.redirect(302, `/about#${APP_SECTION_ID}`);
		return;
	}
	// HEAD — link preview/bot so'rovlari, sanalmaydi
	if (req.method === 'GET') await recordDownload();
	res.setHeader('Cache-Control', 'no-store');
	res.redirect(302, ANDROID_APK_URL);
}

const recordDownload = async (): Promise<void> => {
	try {
		await fetch(GQL_URL, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ query: RECORD_MUTATION }),
			signal: AbortSignal.timeout(RECORD_TIMEOUT_MS),
		});
	} catch {
		// Hisoblagich ishlamasa ham fayl beriladi
	}
};
