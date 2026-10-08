import { Capacitor, registerPlugin } from '@capacitor/core';
import { isNativeApp } from './index';

interface WidgetBridgePlugin {
	setFavorites(options: { ids: string[] }): Promise<void>;
}

const WIDGET_PLUGIN = 'WidgetBridge';
const WidgetBridge = registerPlugin<WidgetBridgePlugin>(WIDGET_PLUGIN);

export const isWidgetBridgeAvailable = (): boolean => isNativeApp() && Capacitor.isPluginAvailable(WIDGET_PLUGIN);

/** Bosh ekran widget'i sevimlilardan (avval chegirmadagisini) ko'rsatadi; bo'sh ro'yxat — umumiy mahsulotlar */
export const setWidgetFavorites = async (ids: string[]): Promise<void> => {
	if (!isWidgetBridgeAvailable()) return;
	try {
		await WidgetBridge.setFavorites({ ids });
	} catch {
		// widget ixtiyoriy — xato app'ni to'xtatmasin
	}
};
