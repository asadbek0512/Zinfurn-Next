import { Capacitor, registerPlugin } from '@capacitor/core';
import { isNativeApp } from './index';

/** @capgo/capacitor-native-biometric — faqat ishlatiladigan qismi */
interface NativeBiometricPlugin {
	isAvailable(): Promise<{ isAvailable: boolean; biometryType: number }>;
	setCredentials(options: {
		username: string;
		password: string;
		server: string;
		accessControl: number;
		title?: string;
	}): Promise<void>;
	getSecureCredentials(options: { server: string; reason?: string; title?: string }): Promise<{
		username: string;
		password: string;
	}>;
	deleteCredentials(options: { server: string }): Promise<void>;
}

const BIOMETRIC_PLUGIN = 'NativeBiometric';
const NativeBiometric = registerPlugin<NativeBiometricPlugin>(BIOMETRIC_PLUGIN);
/** Keychain / Keystore yozuvi kaliti */
const CREDENTIAL_SERVER = 'zinfurn.uz';
/** AccessControl.BIOMETRY_CURRENT_SET — barmoq/yuz o'zgarsa yozuv bekor bo'ladi */
const BIOMETRY_CURRENT_SET = 1;
/** BiometryType: 2 = Face ID, 4 = Android yuz; qolgani barmoq izi */
const FACE_TYPES = new Set([2, 4]);
/** isCredentialsSaved himoyalanmagan yozuvni ham sanaydi — shuning uchun o'z belgimiz (qaysi email saqlangani) */
const ENABLED_KEY = 'zinfurn_biometric_login';

export type BiometryKind = 'face' | 'fingerprint';

/** Qurilmada biometrik bor bo'lsa uning turi, aks holda null */
export const getBiometryKind = async (): Promise<BiometryKind | null> => {
	if (!isNativeApp() || !Capacitor.isPluginAvailable(BIOMETRIC_PLUGIN)) return null;
	try {
		const { isAvailable, biometryType } = await NativeBiometric.isAvailable();
		if (!isAvailable) return null;
		return FACE_TYPES.has(biometryType) ? 'face' : 'fingerprint';
	} catch {
		return null;
	}
};

/** Barmoq iziga bog'langan email (eski versiyada '1' saqlangan) */
const getSavedValue = (): string | null => {
	try {
		return localStorage.getItem(ENABLED_KEY);
	} catch {
		return null;
	}
};

export const isBiometricLoginEnabled = (): boolean => !!getSavedValue();

/** Shu email allaqachon barmoq iziga bog'langanmi */
export const isBiometricLoginFor = (email: string): boolean =>
	getSavedValue()?.toLowerCase() === email.trim().toLowerCase();

/** Email/parolni biometrik himoyali Keychain/Keystore'ga saqlaydi */
export const enableBiometricLogin = async (email: string, password: string, title: string): Promise<boolean> => {
	try {
		await NativeBiometric.setCredentials({
			username: email,
			password,
			server: CREDENTIAL_SERVER,
			accessControl: BIOMETRY_CURRENT_SET,
			title,
		});
		localStorage.setItem(ENABLED_KEY, email.trim().toLowerCase());
		return true;
	} catch {
		return false;
	}
};

export const disableBiometricLogin = async (): Promise<void> => {
	try {
		localStorage.removeItem(ENABLED_KEY);
		await NativeBiometric.deleteCredentials({ server: CREDENTIAL_SERVER });
	} catch {
		// yozuv allaqachon yo'q
	}
};

/** Face ID / barmoq izini so'raydi; bekor qilinsa yoki yozuv yo'qolsa null */
export const getBiometricCredentials = async (
	reason: string,
): Promise<{ email: string; password: string } | null> => {
	try {
		const { username, password } = await NativeBiometric.getSecureCredentials({
			server: CREDENTIAL_SERVER,
			reason,
			title: reason,
		});
		return { email: username, password };
	} catch {
		return null;
	}
};
