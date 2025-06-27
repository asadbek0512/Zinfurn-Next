import { useEffect } from 'react';
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

	useEffect(() => {
		if (typeof window !== 'undefined') {
			AOS.init({
				duration: 1200,
				easing: 'ease-in-out',
				once: true, // ❗ faqat bir marta animatsiya qilish
				offset: 50,
				delay: 0,
				anchorPlacement: 'top-bottom',
				disable: false,
			});

			// DOM to'liq yuklangach elementlarni aniqlash uchun refresh
			setTimeout(() => {
				AOS.refresh();
			}, 1000);
		}
	}, []);

	if (device === 'mobile') {
		return (
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
		);
	}

	return (
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
};

export default withLayoutMain(Home);
