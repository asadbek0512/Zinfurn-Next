import { useEffect, useState } from 'react';
import { NextPage } from 'next';
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

	useEffect(() => {
		AOS.init({
			duration: 1200,
			easing: 'ease-in-out',
			once: true,
			offset: 50,
			delay: 0,
			anchorPlacement: 'top-bottom',
		});

		const handleLoad = () => {
			if (logoLoaded) {
				setShowLoader(false);
				AOS.refresh();
			}
		};

		if (document.readyState === 'complete') {
			handleLoad();
		} else {
			window.addEventListener('load', handleLoad);
			return () => window.removeEventListener('load', handleLoad);
		}
	}, [logoLoaded]);

	const Content = (
		<Stack className="home-page">
			<div data-aos="fade-up">
				<CategoryCards />
			</div>
			<div data-aos="fade-up">
				<TrendProperties />
			</div>
			<div data-aos="fade-up">
				<FlashSale />
			</div>
			<div data-aos="fade-up">
				<Advertisement />
			</div>
			<div data-aos="fade-up">
				<TopProperties />
			</div>
			<div data-aos="fade-up">
				<TopAgents />
			</div>
			<div data-aos="fade-up">
				<Events />
			</div>
			<div data-aos="fade-up">
				<CommunityBoards />
			</div>
		</Stack>
	);

	return (
		<>
			{showLoader && (
				<div className="page-loader">
					<div className="loader-content">
						<img src="/img/banner/001..png" alt="Logo" className="logo" onLoad={() => setLogoLoaded(true)} />
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
					<Stack className="home-page">
						<div data-aos="fade-up">
							<TrendProperties />
						</div>
						<div data-aos="fade-up">
							<Advertisement />
						</div>
						<div data-aos="fade-up">
							<TopProperties />
						</div>
						<div data-aos="fade-up">
							<TopAgents />
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
