/** Android ilova fayli — public/downloads ichida, saytning o'zidan beriladi */
export const ANDROID_APK_URL = '/downloads/zinfurn.apk';
/** Yuklab olishni sanab, APK'ga redirect qiladigan route — havolalar shunga qaraydi */
export const ANDROID_DOWNLOAD_URL = '/api/app-download';
export const APP_SECTION_ID = 'app';
/** QR shu belgi bilan keladi (?src=qr) — Android bo'lmasa about'ga yo'naltiriladi */
export const APP_QR_SOURCE = 'qr';
export const SITE_ORIGIN = 'https://zinfurn.uz';

/**
 * public/downloads/zinfurn.apk ning versionName'i (zinfurn-app/android/app/build.gradle).
 * Yangi APK qo'yilganda shuni oshir — eski app'dagilarga "yangilang" banneri chiqadi.
 */
export const LATEST_ANDROID_APP_VERSION = '1.4';

/** "1.2.10" > "1.2.9" — raqamlar bo'yicha solishtiradi */
export const isVersionOlder = (current: string, latest: string): boolean => {
	const a = current.split('.').map(Number);
	const b = latest.split('.').map(Number);
	for (let i = 0; i < Math.max(a.length, b.length); i++) {
		const diff = (a[i] ?? 0) - (b[i] ?? 0);
		if (diff !== 0) return diff < 0;
	}
	return false;
};
