import React, { useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import CloudDoneIcon from '@mui/icons-material/CloudDone';

/** "Internet tiklandi" xabari shuncha vaqt ko'rinib turadi */
const BACK_ONLINE_MS = 2500;

type NetState = 'online' | 'offline' | 'back';

/** Internet uzilganda yuqorida ingichka banner — sahifa keshdan ishlashda davom etadi */
const OfflineBanner = () => {
	const { t } = useTranslation('common');
	const [state, setState] = useState<NetState>('online');

	useEffect(() => {
		let timer: ReturnType<typeof setTimeout>;
		const goOffline = () => {
			clearTimeout(timer);
			setState('offline');
		};
		const goOnline = () => {
			setState((prev) => (prev === 'offline' ? 'back' : 'online'));
			timer = setTimeout(() => setState('online'), BACK_ONLINE_MS);
		};
		if (!navigator.onLine) goOffline();
		window.addEventListener('offline', goOffline);
		window.addEventListener('online', goOnline);
		return () => {
			clearTimeout(timer);
			window.removeEventListener('offline', goOffline);
			window.removeEventListener('online', goOnline);
		};
	}, []);

	if (state === 'online') return null;
	const offline = state === 'offline';
	return (
		<div className={`offline-banner ${offline ? 'is-offline' : 'is-back'}`} role="status" aria-live="polite">
			{offline ? <CloudOffIcon fontSize="small" /> : <CloudDoneIcon fontSize="small" />}
			<span>{String(t(offline ? 'Offline banner' : 'Online again'))}</span>
		</div>
	);
};

export default OfflineBanner;
