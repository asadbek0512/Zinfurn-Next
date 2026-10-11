import React from 'react';
import Router, { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import useAppMode from '../../hooks/useAppMode';

/**
 * App (WebView) header'idagi orqaga tugmasi — iOS'da tizim "back" tugmasi yo'q,
 * pastki navbar'da yo'q sahifadan chiqib bo'lmay qolardi.
 * Faqat o'z orqaga tugmasi YO'Q sahifalar ro'yxatda: detail, checkout, tracking,
 * mypage bo'limlari o'z tugmasiga ega — ularga qo'shilmaydi.
 */
const PAGES_WITHOUT_BACK = new Set<string>([
	'/about',
	'/privacy',
	'/terms',
	'/compare',
	'/cs',
	'/community',
	'/member',
	'/ai-room-designer',
	'/payment/toss/success',
	'/payment/toss/fail',
	'/404',
	'/500',
]);

const HOME_PATH = '/';

/**
 * Sayt ichida nechta client navigatsiya bo'ldi. 0 = sahifa deep link / push'dan to'g'ridan ochilgan,
 * router.back() app'dan chiqib ketadi. Next 14 pages router history.state'da indeks saqlamaydi.
 */
let inAppNavigations = 0;
if (typeof window !== 'undefined') {
	Router.events.on('routeChangeComplete', () => {
		inAppNavigations += 1;
	});
}

const AppBackButton = () => {
	const router = useRouter();
	const { t } = useTranslation('common');
	const appMode = useAppMode();

	if (!appMode || !PAGES_WITHOUT_BACK.has(router.pathname)) return null;

	const goBack = async () => {
		if (inAppNavigations > 0) router.back();
		else await router.push(HOME_PATH);
	};

	return (
		<button type="button" className="app-header-back" onClick={goBack} aria-label={t('Back')}>
			<ArrowBackIosNewIcon sx={{ fontSize: 20 }} />
		</button>
	);
};

export default AppBackButton;
