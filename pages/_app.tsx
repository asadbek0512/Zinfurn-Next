import type { AppProps } from 'next/app';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import React, { useEffect, useMemo } from 'react';
import { light, dark } from '../scss/MaterialTheme';
import { ThemeModeProvider, useThemeMode } from '../libs/context/ThemeContext';
import { ApolloProvider } from '@apollo/client';
import { useApollo } from '../apollo/client';
import { appWithTranslation } from 'next-i18next';
import '../scss/app.scss';
import '../scss/pc/main.scss';
import '../scss/mobile/main.scss';
import { useRouter } from 'next/router';
import { updateUserInfo, updateStorage, restoreSession } from '../libs/auth';
import CartDrawer from '../libs/components/cart/CartDrawer';
import { CurrencyProvider } from '../libs/context/CurrencyContext';
import SEO from '../libs/components/common/SEO';
import { detectDevice } from '../libs/hooks/useDeviceDetect';

const PAGE_TITLES: Record<string, string> = {
	'/property': 'Furniture Collection',
	'/repairService': 'Furniture Repair Service',
	'/community': 'Community',
	'/agent': 'Our Agents',
	'/cs': 'Customer Support',
	'/checkout': 'Checkout',
	'/mypage': 'My Page',
	'/account/join': 'Login / Sign up',
};

const App = ({ Component, pageProps }: AppProps) => {
	const { mode } = useThemeMode();
	// @ts-ignore
	const theme = useMemo(() => createTheme(mode === 'dark' ? dark : light), [mode]);
	const client = useApollo(pageProps.initialApolloState);
	const router = useRouter();
	const pageTitle = PAGE_TITLES[router.pathname];

	useEffect(() => {
		// Refresh qilganda browser oldingi scroll joyini tiklamasin — har doim tepadan boshlansin
		if ('scrollRestoration' in window.history) {
			window.history.scrollRestoration = 'manual';
		}
	}, []);

	// Oyna mobil/desktop chegarasini kesib o'tganda — sahifani avtomatik qayta yuklash.
	// detectDevice() UA+kenglikni hisobga oladi — haqiqiy telefon aylantirilganda reload bo'lmaydi.
	useEffect(() => {
		let current = detectDevice();
		let timer: ReturnType<typeof setTimeout>;
		const onResize = () => {
			clearTimeout(timer);
			timer = setTimeout(() => {
				const next = detectDevice();
				if (next !== current) {
					current = next;
					window.location.reload();
				}
			}, 250);
		};
		window.addEventListener('resize', onResize);
		return () => {
			window.removeEventListener('resize', onResize);
			clearTimeout(timer);
		};
	}, []);

	// Sessiyani tiklash: eskirgan token bo'lsa refresh qilinadi, imkonsiz bo'lsa tozalanadi.
	// Muddati o'tgan tokenni ko'r-ko'rona userVar ga yozish — "login ko'rinadi, lekin har
	// so'rov 401" holatiga olib kelardi.
	useEffect(() => {
		restoreSession();
	}, []);

	// Sessiya boshqa tabda tugatilsa yoki tab uzoq ochiq turib qaytilsa — holatni qayta tekshiramiz
	useEffect(() => {
		const onFocus = () => {
			if (document.visibilityState === 'visible') restoreSession();
		};
		document.addEventListener('visibilitychange', onFocus);
		return () => document.removeEventListener('visibilitychange', onFocus);
	}, []);

	useEffect(() => {
		// OAuth (Google/Telegram) redirect: ?token=...&refresh=... — ikkalasini saqlaymiz.
		// refresh bo'lmasa ham (eski oqim) token bilan ishlayveradi — bog'lash buzilmaydi.
		const { token, refresh } = router.query;
		if (token && typeof token === 'string') {
			updateStorage({ jwtToken: token, refreshToken: typeof refresh === 'string' ? refresh : undefined });
			updateUserInfo(token);
			router.replace(router.pathname === '/mypage' ? '/mypage' : '/');
		}
	}, [router.query]);

	return (
		<ApolloProvider client={client}>
			<ThemeProvider theme={theme}>
				<CssBaseline />
				<CurrencyProvider>
					<SEO title={pageTitle} url={`https://zinfurn.uz${router.asPath?.split('?')[0] || ''}`} />
					<Component {...pageProps} />
					<CartDrawer />
				</CurrencyProvider>
			</ThemeProvider>
		</ApolloProvider>
	);
};

const AppWithTheme = (props: AppProps) => (
	<ThemeModeProvider>
		<App {...props} />
	</ThemeModeProvider>
);

export default appWithTranslation(AppWithTheme);
