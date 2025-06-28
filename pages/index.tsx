import { useEffect, useState } from 'react';
import { NextPage } from 'next';
import Image from 'next/image';
import useDeviceDetect from '../libs/hooks/useDeviceDetect';
import withLayoutMain from '../libs/components/layout/LayoutHome';
import CommunityBoards from '../libs/components/homepage/CommunityBoards';
import TopAgents from '../libs/components/homepage/TopAgents';
import Events from '../libs/components/homepage/Events';
import TrendProperties from '../libs/components/homepage/TrendProperties';
import TopProperties from '../libs/components/homepage/TopProperties';
import { Stack } from '@mui/material';
import Advertisement from '../libs/components/homepage/Advertisement';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import CategoryCards from '../libs/components/homepage/CategoryCard';
import FlashSale from '../libs/components/homepage/PopularProperties';
import AOS from 'aos';
import 'aos/dist/aos.css';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const Home: NextPage = () => {
	const device = useDeviceDetect();
	const [showLoader, setShowLoader] = useState(true);
	const [logoLoaded, setLogoLoaded] = useState(false);

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

	const handleLogoLoad = () => {
		setLogoLoaded(true);
	};

	useEffect(() => {
		AOS.init({
			duration: 1200,
			easing: 'ease-out-cubic',
			once: true,
			mirror: false,
			offset: 120,
			delay: 20,
			anchorPlacement: 'top-bottom',
		});

		const handlePageLoad = () => {
			if (logoLoaded) {
				setShowLoader(false);
				setTimeout(() => {
					AOS.refresh();
				}, 300);
			}
		};

		if (document.readyState === 'complete') {
			handlePageLoad();
		} else {
			window.addEventListener('load', handlePageLoad);
			return () => window.removeEventListener('load', handlePageLoad);
		}
	}, [logoLoaded]);

	const Content = (
		<Stack className="home-page" spacing={4}>
			<div data-aos="fade-up" data-aos-delay="0">
				<CategoryCards />
			</div>
			<div data-aos="fade-up" data-aos-delay="100">
				<TrendProperties />
			</div>
			<div data-aos="fade-up" data-aos-delay="200">
				<FlashSale />
			</div>
			<div data-aos="fade-up" data-aos-delay="300">
				<Advertisement />
			</div>
			<div data-aos="fade-up" data-aos-delay="400">
				<TopProperties />
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
							onLoadingComplete={handleLogoLoad}
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

			{!showLoader &&
				(device === 'mobile' ? (
					<Stack className="home-page" spacing={4}>
						<div data-aos="fade-up" data-aos-delay="0">
							<TrendProperties />
						</div>
						<div data-aos="fade-up" data-aos-delay="100">
							<Advertisement />
						</div>
						<div data-aos="fade-up" data-aos-delay="300">
							<TopAgents />
						</div>
						<div data-aos="fade-up" data-aos-delay="200">
							<TopProperties />
						</div>
					</Stack>
				) : (
					Content
				))}

			<style jsx>{`
				.page-loader {
					position: fixed;
					top: 0;
					left: 0;
					z-index: 9999;
					width: 100%;
					height: 100vh;
					background-color: #fff;
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
					color: #333;
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
