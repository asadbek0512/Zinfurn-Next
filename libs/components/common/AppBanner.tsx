import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import CloseIcon from '@mui/icons-material/Close';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { isAppMode } from '../../hooks/useAppMode';
import { isNativeApp, openInSystemBrowser } from '../../native';
import {
	ANDROID_DOWNLOAD_URL,
	APP_SECTION_ID,
	LATEST_ANDROID_APP_VERSION,
	SITE_ORIGIN,
	isVersionOlder,
} from '../../config/appDownload';

type BannerMode = 'android' | 'ios' | 'update';

const DISMISS_KEY_PREFIX = 'zinfurn_app_banner_dismissed';
/** Yopilgandan keyin banner shuncha kun qayta chiqmaydi */
const DISMISS_DAYS: Record<BannerMode, number> = { android: 7, ios: 7, update: 1 };
const DAY_MS = 24 * 60 * 60 * 1000;
/** Sahifa ochilishi bilan emas, biroz keyin chiqadi — kontentni to'sib qo'ymasligi uchun */
const SHOW_DELAY_MS = 1500;
const ANDROID_UA = /Android/i;
const IOS_UA = /iPhone|iPad|iPod/i;
const HIDDEN_PATHS = new Set(['/about', '/checkout', '/account/join']);

const dismissKey = (mode: BannerMode): string => `${DISMISS_KEY_PREFIX}_${mode}`;

const isDismissed = (mode: BannerMode): boolean => {
	try {
		const at = Number(localStorage.getItem(dismissKey(mode)));
		return Boolean(at) && Date.now() - at < DISMISS_DAYS[mode] * DAY_MS;
	} catch {
		return false;
	}
};

/** iOS'da "Bosh ekranga qo'shilgan" (PWA) holatda ochilganmi */
const isStandalone = (): boolean => {
	const nav = navigator as Navigator & { standalone?: boolean };
	return Boolean(nav.standalone) || window.matchMedia('(display-mode: standalone)').matches;
};

const needsAppUpdate = async (): Promise<boolean> => {
	if (!isNativeApp() || Capacitor.getPlatform() !== 'android') return false;
	try {
		const { version } = await App.getInfo();
		return isVersionOlder(version, LATEST_ANDROID_APP_VERSION);
	} catch {
		return false;
	}
};

const detectMode = async (): Promise<BannerMode | null> => {
	if (isAppMode()) return (await needsAppUpdate()) ? 'update' : null;
	const ua = navigator.userAgent;
	if (ANDROID_UA.test(ua)) return 'android';
	if (IOS_UA.test(ua) && !isStandalone()) return 'ios';
	return null;
};

/**
 * Mobil web'da tepadan chiqadigan banner:
 * Android — ilovani yuklab olish, iOS — bosh ekranga qo'shish (PWA),
 * eski app ichida — yangi versiyani o'rnatish.
 */
const AppBanner = () => {
	const { t } = useTranslation('common');
	const router = useRouter();
	const [mode, setMode] = useState<BannerMode | null>(null);

	useEffect(() => {
		let timer: ReturnType<typeof setTimeout> | undefined;
		const init = async () => {
			const detected = await detectMode();
			if (!detected || isDismissed(detected)) return;
			timer = setTimeout(() => setMode(detected), SHOW_DELAY_MS);
		};
		init();
		return () => clearTimeout(timer);
	}, []);

	const dismiss = () => {
		if (!mode) return;
		setMode(null);
		try {
			localStorage.setItem(dismissKey(mode), String(Date.now()));
		} catch {
			// private mode — faqat shu sessiya uchun yopiladi
		}
	};

	// WebView APK'ni o'zi yuklay olmaydi — tizim brauzerida ochiladi
	const updateApp = async () => {
		dismiss();
		await openInSystemBrowser(`${SITE_ORIGIN}${ANDROID_DOWNLOAD_URL}`);
	};

	if (!mode || HIDDEN_PATHS.has(router.pathname) || router.pathname.startsWith('/_admin')) return null;

	const title = mode === 'update' ? t('A new version of the app is available') : mode === 'ios' ? t('Add Zinfurn to your Home Screen') : t('Get the Zinfurn app');
	const subtitle = mode === 'update' ? t('Update for the latest features') : mode === 'ios' ? t('Opens full screen, like an app') : t('Faster shopping and AR in your room');

	return (
		<div className={`app-banner${mode === 'update' ? ' in-app' : ''}`} role="dialog" aria-label={title}>
			<img src="/img/logo/app-icon.png" alt="Zinfurn" className="app-banner-icon" />
			<div className="app-banner-text">
				<strong>{title}</strong>
				<span>{subtitle}</span>
			</div>
			{mode === 'update' ? (
				<button type="button" className="app-banner-cta" onClick={updateApp}>
					{t('Update')}
				</button>
			) : (
				<Link href={`/about#${APP_SECTION_ID}`} className="app-banner-cta" onClick={dismiss}>
					{mode === 'ios' ? t('How?') : t('Download')}
				</Link>
			)}
			<button type="button" className="app-banner-close" aria-label={t('Close')} onClick={dismiss}>
				<CloseIcon sx={{ fontSize: 18 }} />
			</button>
		</div>
	);
};

export default AppBanner;
