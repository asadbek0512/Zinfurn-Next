import type { AppProps } from 'next/app';
import dynamic from 'next/dynamic';
import Head from 'next/head';
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
import { sweetMixinErrorAlert } from '../libs/sweetAlert';
import CartDrawer from '../libs/components/cart/CartDrawer';
import CompareBar from '../libs/components/common/CompareBar';
import AppBanner from '../libs/components/common/AppBanner';
import OfflineBanner from '../libs/components/common/OfflineBanner';
import { registerServiceWorker } from '../libs/utils/serviceWorker';
const APP_LINK_HOSTS = ['zinfurn.uz', 'www.zinfurn.uz'];
// Loader yopilganda navbar tayyor turishi uchun asosiy bundle'da (alohida chunk kech kelardi)
import AppBottomNav from '../libs/components/layout/AppBottomNav';
import AppSplashGate from '../libs/components/layout/AppSplashGate';
const AppPullToRefresh = dynamic(() => import('../libs/components/layout/AppPullToRefresh'), { ssr: false });
const AppChatFabs = dynamic(() => import('../libs/components/layout/AppChatFabs'), { ssr: false });
import { CurrencyProvider } from '../libs/context/CurrencyContext';
import SEO from '../libs/components/common/SEO';
import BrandJsonLd from '../libs/components/common/BrandJsonLd';
import Analytics from '../libs/components/common/Analytics';
import ErrorMonitoring from '../libs/components/common/ErrorMonitoring';
import { detectDevice } from '../libs/hooks/useDeviceDetect';

const PAGE_TITLES: Record<string, string> = {
	'/products': 'Furniture Collection',
	'/repairService': 'Furniture Repair Service',
	'/community': 'Community',
	'/agent': 'Our Agents',
	'/cs': 'Customer Support',
	'/checkout': 'Checkout',
	'/mypage': 'My Page',
	'/account/join': 'Login / Sign up',
};

// Shaxsiy/tranzaksion sahifalar qidiruv natijasida chiqmasligi kerak — brend so'ralganda
// "Login / Sign up" natijasi bosh sahifadan oldin turib qolardi.
// Diqqat: bu yo'llar robots.txt da bloklanmasligi shart, aks holda Googlebot
// sahifaga kira olmay noindex'ni ko'rmaydi va eski indeks yozuvi qolib ketadi.
const NOINDEX_PATHS = new Set(['/account/join', '/checkout', '/payment/toss/success', '/payment/toss/fail', '/mypage', '/order/tracking']);

const App = ({ Component, pageProps }: AppProps) => {
	const { mode } = useThemeMode();
	// @ts-ignore
	const theme = useMemo(() => createTheme(mode === 'dark' ? dark : light), [mode]);
	const client = useApollo(pageProps.initialApolloState);
	const router = useRouter();
	const pageTitle = PAGE_TITLES[router.pathname];

	// Canonical har til uchun o'ziga ishora qilishi kerak. Locale prefiksisiz
	// barcha tillar bitta inglizcha URL'ga canonical berardi — Google faqat
	// bittasini indekslab, qolgan 4 tilni tashlab yuborardi.
	const { locale = 'en', defaultLocale = 'en' } = router;
	const localePrefix = locale === defaultLocale ? '' : `/${locale}`;
	const canonicalUrl = `https://zinfurn.uz${localePrefix}${router.asPath?.split('?')[0] || ''}`;

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

	useEffect(() => {
		registerServiceWorker();
	}, []);

	// Sessiya boshqa tabda tugatilsa yoki tab uzoq ochiq turib qaytilsa — holatni qayta tekshiramiz
	useEffect(() => {
		const onFocus = () => {
			if (document.visibilityState === 'visible') restoreSession();
		};
		document.addEventListener('visibilitychange', onFocus);
		return () => document.removeEventListener('visibilitychange', onFocus);
	}, []);

	// Mobil app (Capacitor): OAuth tizim brauzerida bajariladi va natija
	// uz.zinfurn.app://auth?token=...&refresh=...&target=/mypage deep link'i bilan qaytadi.
	useEffect(() => {
		let remove: (() => void) | undefined;

		(async () => {
			const { isNativeApp, closeSystemBrowser } = await import('../libs/native');
			if (!isNativeApp()) return;

			const { App: CapApp } = await import('@capacitor/app');

			// zinfurn.uz havolasi (App Link / Universal Link) app'ni ochsa — o'sha sahifaga o'tamiz
			const openSiteLink = async (url: string): Promise<boolean> => {
				if (!url.startsWith('https://')) return false;
				const link = new URL(url);
				if (!APP_LINK_HOSTS.includes(link.hostname)) return false;
				const path = `${link.pathname}${link.search}${link.hash}`;
				if (path !== router.asPath) await router.push(path);
				return true;
			};

			const launch = await CapApp.getLaunchUrl();
			if (launch?.url) await openSiteLink(launch.url);

			const handle = await CapApp.addListener('appUrlOpen', async ({ url }) => {
				if (await openSiteLink(url)) return;
				if (!url.includes('://auth')) return;
				await closeSystemBrowser();

				const params = new URLSearchParams(url.split('?')[1] ?? '');
				const error = params.get('error');
				if (error) {
					await sweetMixinErrorAlert(error);
					return;
				}

				const token = params.get('token');
				if (!token) return;
				updateStorage({ jwtToken: token, refreshToken: params.get('refresh') ?? undefined });
				updateUserInfo(token);
				await router.replace(params.get('target') || '/');
			});
			remove = () => handle.remove();
		})();

		return () => remove?.();
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
					<BrandJsonLd />
					<Analytics />
					<ErrorMonitoring />
					{/* SSR HTML'da ham initial-scale=1 bo'lsin — aks holda WebView desktop markup'ini
					    ko'rib sahifani kichraytiradi (app loader'i kichrayib qoladi). AppBottomNav shu key bilan almashtiradi */}
					<Head>
						<meta name="viewport" content="width=device-width, initial-scale=1" key="viewport" />
					</Head>
					<SEO title={pageTitle} url={canonicalUrl} noindex={NOINDEX_PATHS.has(router.pathname)} />
					<Component {...pageProps} />
					<CartDrawer />
					<CompareBar />
					<AppBanner />
					<OfflineBanner />
					<AppBottomNav />
					<AppPullToRefresh />
					<AppSplashGate />
					<AppChatFabs />
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
