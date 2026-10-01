import { useEffect, useState } from 'react';
import type { NextPage } from 'next';
import { consumeTelegramRedirectResult } from '../../libs/utils/telegramAuth';

/** Tizim brauzeridagi Telegram oauth natijasini backend'ga uzatadi — u app'ga deep link bilan qaytaradi */
const TelegramAppBridge: NextPage = () => {
	const [failed, setFailed] = useState(false);

	useEffect(() => {
		try {
			const result = consumeTelegramRedirectResult();
			if (!result) return setFailed(true);
			const query = new URLSearchParams(Object.entries(result).map(([key, value]) => [key, String(value)]));
			window.location.replace(`${process.env.REACT_APP_API_URL}/auth/app/telegram?${query.toString()}`);
		} catch {
			setFailed(true);
		}
	}, []);

	return (
		<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
			{failed ? 'Telegram login failed. Close this window and try again.' : 'Signing in…'}
		</div>
	);
};

export default TelegramAppBridge;
