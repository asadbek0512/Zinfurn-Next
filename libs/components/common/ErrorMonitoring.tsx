import { useEffect } from 'react';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN || '';

// DSN bo'lmasa Sentry paketi hech qachon yuklanmaydi (dynamic import) —
// lokal/staging'da bundle og'irlashmaydi va tarmoq so'rovi ketmaydi.
// next.config.js'ga tegilmagan — build/webpack xatti-harakati o'zgarmaydi.
const ErrorMonitoring = () => {
	useEffect(() => {
		if (!SENTRY_DSN) return;
		let active = true;
		import('@sentry/browser').then((Sentry) => {
			if (!active) return;
			Sentry.init({
				dsn: SENTRY_DSN,
				environment: process.env.NODE_ENV,
				tracesSampleRate: 0.1,
			});
		});
		return () => {
			active = false;
		};
	}, []);

	return null;
};

export default ErrorMonitoring;
