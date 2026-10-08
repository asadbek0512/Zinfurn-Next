import { Capacitor, registerPlugin } from '@capacitor/core';
import { isIosApp } from './index';

interface ArQuickLookPlugin {
	isAvailable(): Promise<{ available: boolean }>;
	open(options: { data: string }): Promise<void>;
}

const AR_QUICK_LOOK_PLUGIN = 'ArQuickLook';
const ArQuickLook = registerPlugin<ArQuickLookPlugin>(AR_QUICK_LOOK_PLUGIN);
/** btoa uchun bo'laklab o'giramiz — butun massivni spread qilsak call stack to'lib ketadi */
const BASE64_CHUNK = 0x8000;

/** iOS app'da WKWebView Quick Look'ni ochmaydi — buni native plugin qiladi (ARKit'li iPhone'da) */
export const isNativeArQuickLookAvailable = async (): Promise<boolean> => {
	if (!isIosApp() || !Capacitor.isPluginAvailable(AR_QUICK_LOOK_PLUGIN)) return false;
	try {
		const { available } = await ArQuickLook.isAvailable();
		return available;
	} catch {
		return false;
	}
};

const toBase64 = (bytes: Uint8Array): string => {
	let binary = '';
	for (let i = 0; i < bytes.length; i += BASE64_CHUNK) {
		binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + BASE64_CHUNK)));
	}
	return btoa(binary);
};

/** GLB'ni USDZ'ga aylantirib (model-viewer Safari'da ham shunday qiladi) AR Quick Look'da ochadi */
export const openNativeArQuickLook = async (glbUrl: string): Promise<void> => {
	const [{ GLTFLoader }, { USDZExporter }] = await Promise.all([
		import('three/examples/jsm/loaders/GLTFLoader'),
		import('three/examples/jsm/exporters/USDZExporter'),
	]);
	const gltf = await new GLTFLoader().loadAsync(glbUrl);
	const usdz = await new USDZExporter().parse(gltf.scene);
	await ArQuickLook.open({ data: toBase64(usdz) });
};
