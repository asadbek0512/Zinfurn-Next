import React, { useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import SystemUpdateOutlinedIcon from '@mui/icons-material/SystemUpdateOutlined';
import useAppMode from '../../hooks/useAppMode';
import { isNativeApp, openInSystemBrowser } from '../../native';
import { ANDROID_DOWNLOAD_URL, LATEST_ANDROID_APP_VERSION, SITE_ORIGIN, isVersionOlder } from '../../config/appDownload';

const VERSION_API = '/api/app-version';

type UpdateKind = 'native' | 'web' | null;

/** Native app eskirganmi (yangi APK kerak) — faqat Android, iOS App Store o'zi yangilaydi */
const getNativeVersion = async (): Promise<{ version: string; outdated: boolean } | null> => {
	if (!isNativeApp()) return null;
	try {
		const { version } = await App.getInfo();
		const outdated = Capacitor.getPlatform() === 'android' && isVersionOlder(version, LATEST_ANDROID_APP_VERSION);
		return { version, outdated };
	} catch {
		return null;
	}
};

/** Serverga yangi sayt deploy qilinganmi — ochiq turgan sahifa eski build'da qolgan bo'lsa */
const isWebOutdated = async (): Promise<boolean> => {
	const current = (window as Window & { __NEXT_DATA__?: { buildId?: string } }).__NEXT_DATA__?.buildId;
	try {
		const res = await fetch(VERSION_API, { cache: 'no-store' });
		const { buildId } = (await res.json()) as { buildId: string | null };
		return Boolean(buildId && current && buildId !== current);
	} catch {
		return false;
	}
};

/**
 * My Page tagidagi Telegram uslubidagi qator: "Zinfurn v1.6" va yangilanish bo'lsa "Yangilash" tugmasi.
 * Native yangilanish (yangi APK) web yangilanishdan ustun — APK'siz yangi native imkoniyat ishlamaydi.
 */
const AppVersionRow = () => {
	const { t } = useTranslation('common');
	const appMode = useAppMode();
	const [version, setVersion] = useState<string | null>(null);
	const [update, setUpdate] = useState<UpdateKind>(null);

	useEffect(() => {
		if (!appMode) return;
		const check = async () => {
			const native = await getNativeVersion();
			setVersion(native?.version ?? null);
			if (native?.outdated) setUpdate('native');
			else if (await isWebOutdated()) setUpdate('web');
		};
		check();
	}, [appMode]);

	if (!appMode) return null;

	const handleUpdate = async () => {
		if (update === 'native') await openInSystemBrowser(`${SITE_ORIGIN}${ANDROID_DOWNLOAD_URL}`);
		else window.location.reload();
	};

	return (
		<div className={`mob-mymenu-version ${update ? 'has-update' : ''}`}>
			<SystemUpdateOutlinedIcon className="mob-mymenu-version-icon" />
			<div className="mob-mymenu-version-text">
				<span className="mob-mymenu-version-name">Zinfurn{version ? ` v${version}` : ''}</span>
				<span className="mob-mymenu-version-status">
					{update === 'native' ? t('Update available') : update === 'web' ? t('New version ready') : t('Latest version')}
				</span>
			</div>
			{update && (
				<button type="button" className="mob-mymenu-version-btn" onClick={handleUpdate}>
					{t('Update')}
				</button>
			)}
		</div>
	);
};

export default AppVersionRow;
