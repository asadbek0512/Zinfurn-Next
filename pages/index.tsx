import { useEffect, useState } from 'react';
import { NextPage } from 'next';
import Image from 'next/image';
import useDeviceDetect from '../libs/hooks/useDeviceDetect';
import withLayoutMain from '../libs/components/layout/LayoutHome';
import CommunityBoards from '../libs/components/homepage/CommunityBoards';
import TopAgents, { TOP_AGENTS_INPUT } from '../libs/components/homepage/TopAgents';
import Events from '../libs/components/homepage/Events';
import TrendProducts, { TREND_PRODUCTS_INPUT } from '../libs/components/homepage/TrendProducts';
import { ApolloClient, HttpLink, InMemoryCache, NormalizedCacheObject } from '@apollo/client';
import { GET_AGENTS, GET_PRODUCTS } from '../apollo/user/query';
import TopProducts, { TOP_PRODUCTS_INITIAL_INPUT } from '../libs/components/homepage/TopProducts';
import { Stack } from '@mui/material';
import Advertisement from '../libs/components/homepage/Advertisement';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import CategoryCards from '../libs/components/homepage/CategoryCard';
import FlashSale, { FLASH_SALE_INPUT } from '../libs/components/homepage/PopularProducts';
import AiRoomBanner from '../libs/components/homepage/AiRoomBanner';
import AOS from 'aos';
import useAppMode, { isAppMode } from '../libs/hooks/useAppMode';
import 'aos/dist/aos.css';
import { LocaleContext, DEFAULT_LOCALE } from '../libs/types/common';

const HOME_REVALIDATE_SECONDS = 60;

// Bosh sahifa bloklari ma'lumoti HTML bilan birga keladi — birinchi kirishda client
// JS yuklangach yana API'ga (uzoq server) borib kutib o'tirmaydi
const prefetchHomeData = async (): Promise<NormalizedCacheObject | null> => {
	try {
		const client = new ApolloClient({
			ssrMode: true,
			link: new HttpLink({ uri: process.env.REACT_APP_API_GRAPHQL_URL }),
			cache: new InMemoryCache(),
		});
		// Bittasi yiqilsa qolganlari baribir keshga tushadi — yiqilgani client'da yuklanadi
		await Promise.allSettled([
			client.query({ query: GET_PRODUCTS, variables: { input: TREND_PRODUCTS_INPUT } }),
			client.query({ query: GET_PRODUCTS, variables: { input: FLASH_SALE_INPUT } }),
			client.query({ query: GET_PRODUCTS, variables: { input: TOP_PRODUCTS_INITIAL_INPUT } }),
			client.query({ query: GET_AGENTS, variables: { input: TOP_AGENTS_INPUT } }),
		]);
		return client.cache.extract();
	} catch {
		// API javob bermasa sahifa baribir chiqadi — bloklar client'da yuklanadi
		return null;
	}
};

export const getStaticProps = async ({ locale }: LocaleContext) => {
	const initialApolloState = await prefetchHomeData();
	return {
		props: {
			...(await serverSideTranslations(locale ?? DEFAULT_LOCALE, ['common'])),
			...(initialApolloState ? { initialApolloState } : {}),
		},
		revalidate: HOME_REVALIDATE_SECONDS,
	};
};

const Home: NextPage = () => {
	const device = useDeviceDetect();
	const [showLoader, setShowLoader] = useState(true);
	const appMode = useAppMode();

	// App'da scroll effekti yo'q — kontent darrov ko'rinadi (faqat vebda fade-up)
	const aosProps = (delay: number) => (appMode ? {} : { 'data-aos': 'fade-up', 'data-aos-delay': String(delay) });

	// No-op qo'shildi
	const unused = () => {};
	// No-op qo'shildi
	const unused2 = () => {};
	// No-op qo'shildi
	const unused3 = () => {};
	// No-op qo'shildi
	const unuse4d = () => {};
	// No-op qo'shildi
	const unused5 = () => {};
	// No-op qo'shildi
	const unused6 = () => {};

	useEffect(() => {
		// App'ning o'z splash'i bor — loader kerak emas
		if (isAppMode()) {
			setShowLoader(false);
			return;
		}

		AOS.init({
			duration: 1200,
			easing: 'ease-out-cubic',
			once: true,
			mirror: false,
			offset: 120,
			delay: 20,
			anchorPlacement: 'top-bottom',
		});

		// Loader faqat hydration'gacha. Avval window 'load' (hamma rasmlar) kutilardi va kontent
		// umuman render qilinmasdi — query'lar ham shundan keyin boshlanib, sekin tarmoqda
		// birinchi kirish soniyalab cho'zilardi.
		setShowLoader(false);
		const refreshTimer = setTimeout(() => AOS.refresh(), 100);
		return () => clearTimeout(refreshTimer);
	}, []);

	const Content = (
		<Stack className="home-page" spacing={4}>
			<div data-aos="fade-up" data-aos-delay="0">
				<CategoryCards />
			</div>
			<div data-aos="fade-up" data-aos-delay="100">
				<TrendProducts />
			</div>
			<div data-aos="fade-up" data-aos-delay="150">
				<AiRoomBanner />
			</div>
			<div data-aos="fade-up" data-aos-delay="200">
				<FlashSale />
			</div>
			<div data-aos="fade-up" data-aos-delay="300">
				<Advertisement />
			</div>
			<div data-aos="fade-up" data-aos-delay="400">
				<TopProducts />
			</div>
			<div data-aos="fade-up" data-aos-delay="500">
				<TopAgents />
			</div>
			<div data-aos="fade-up" data-aos-delay="600">
				<Events />
			</div>
			<div data-aos="fade-up" data-aos-delay="700">
				<CommunityBoards />
			</div>
		</Stack>
	);

	return (
		<>
			{showLoader && (
				<div className="page-loader">
					<div className="loader-content">
						<Image
							src="/img/banner/001..png"
							alt="Logo"
							width={110}
							height={110}
							priority
							className="logo"
						/>
						<div className="dots">
							<span>.</span>
							<span>.</span>
							<span>.</span>
							<span>.</span>
							<span>.</span>
						</div>
					</div>
				</div>
			)}

			{device === 'mobile' ? (
					<Stack className="home-page" spacing={4}>
						<div {...aosProps(0)}>
							<CategoryCards />
						</div>
						<div {...aosProps(100)}>
							<TrendProducts />
						</div>
						<div {...aosProps(150)}>
							<AiRoomBanner />
						</div>
						<div {...aosProps(200)}>
							<FlashSale />
						</div>
						<div {...aosProps(300)}>
							<Advertisement />
						</div>
						<div {...aosProps(400)}>
							<TopProducts />
						</div>
						<div {...aosProps(500)}>
							<TopAgents />
						</div>
						<div {...aosProps(600)}>
							<Events />
						</div>
						<div {...aosProps(700)}>
							<CommunityBoards />
						</div>
					</Stack>
				) : (
					Content
				)}

			<style jsx>{`
				.page-loader {
					position: fixed;
					top: 0;
					left: 0;
					z-index: 9999;
					width: 100%;
					height: 100vh;
					background-color: var(--bg-page);
					display: flex;
					align-items: center;
					justify-content: center;
				}

				.loader-content {
					display: flex;
					flex-direction: row;
					align-items: center;
					gap: 20px;
				}

				.logo {
					width: 90px;
					height: auto;
				}

				.dots {
					display: flex;
					gap: 6px;
				}

				.dots span {
					font-size: 54px;
					font-weight: bold;
					color: var(--text-2);
					animation: blink 1.4s infinite;
				}

				.dots span:nth-child(2) {
					animation-delay: 0.2s;
				}
				.dots span:nth-child(3) {
					animation-delay: 0.4s;
				}
				.dots span:nth-child(4) {
					animation-delay: 0.6s;
				}
				.dots span:nth-child(5) {
					animation-delay: 0.8s;
				}

				@keyframes blink {
					0%,
					80%,
					100% {
						opacity: 0;
					}
					40% {
						opacity: 1;
					}
				}
			`}</style>
		</>
	);
};

export default withLayoutMain(Home);
