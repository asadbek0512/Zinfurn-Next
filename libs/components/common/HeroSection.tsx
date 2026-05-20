import React, { useState, useEffect } from 'react';
import { Stack, Typography, Button, Box } from '@mui/material';
import { ArrowBack, ArrowForward } from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import useDeviceDetect from '../../hooks/useDeviceDetect';

interface Slide {
	overline: string;
	title: string;
	mobileTitle: string;
	description: string;
	mobileDescription: string;
	backgroundImage: string;
}

const HeroSection: React.FC = () => {
	const { t } = useTranslation('common');
	const device = useDeviceDetect();
	const [currentSlide, setCurrentSlide] = useState<number>(0);

	const slides: Slide[] = [
		{
			overline: t('TIMELESS ELEGANCE'),
			title: t("Discover Furniture's For Living"),
			mobileTitle: t('Furniture For Living'),
			description: t(
				'Consectetur a erat nam at. Facilisis magna etiam tempor orci. Sem et tortor consequat id. Fermentum egestas tellus. Nunc eu hendrerit turpis. Fusce non lectus sem.',
			),
			mobileDescription: t('Quality furniture pieces that elevate your home with timeless style and elegance.'),
			backgroundImage: '/img/banner/Home-1-.jpg',
		},
		{
			overline: t('SMART SOLUTION'),
			title: t('Enjoy With Style & Comfort'),
			mobileTitle: t('Style & Comfort'),
			description: t(
				'Feugiat pretium nibh ipsum consequat nisi vel pretium lectus quam. Aliquam ut porttitor leo a diam sollicitudin. Nam at lectus urna duis convallis.',
			),
			mobileDescription: t('Modern furniture designed for comfort, durability, and everyday stylish living.'),
			backgroundImage: '/img/banner/Home-2-.jpg',
		},
		{
			overline: t('CREATE MEMORIES'),
			title: t("Embrace The Beauty Of Furniture's"),
			mobileTitle: t('Embrace The Beauty'),
			description: t(
				'Ut placerat orci nulla pellentesque posuere lorem ipsum dolor. A condimentum vitae sapien pellentesque habitant morbi tristique senectus.',
			),
			mobileDescription: t('Beautiful spaces start with the right furniture choices for your unique home.'),
			backgroundImage: '/img/banner/257.jpg',
		},
	];

	const nextSlide = (): void => setCurrentSlide((prev) => (prev + 1) % slides.length);
	const prevSlide = (): void => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

	useEffect(() => {
		const interval = setInterval(nextSlide, 10000);
		return () => clearInterval(interval);
	}, []);

	const isMobile = device === 'mobile';

	return (
		<>
			<style>{`
				@keyframes fadeInUp {
					0% { opacity: 0; transform: translateY(30px); }
					100% { opacity: 1; transform: translateY(0); }
				}
			`}</style>

			{/* Cross-fade background images — absolute to .header-main */}
			{slides.map((slide, index) => (
				<Box
					key={index}
					component={'div'}
					sx={{
						position: 'absolute',
						inset: 0,
						backgroundImage: `url(${slide.backgroundImage})`,
						backgroundSize: 'cover',
						backgroundPosition: 'center',
						backgroundRepeat: 'no-repeat',
						opacity: index === currentSlide ? 1 : 0,
						transition: 'opacity 0.9s ease-in-out',
						zIndex: 0,
					}}
				/>
			))}

			{/* Dark overlay */}
			<Box
				component={'div'}
				sx={{
					position: 'absolute',
					inset: 0,
					background: 'linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.25) 100%)',
					zIndex: 1,
				}}
			/>

			{/* Navigation — Prev */}
			<Box
				component={'div'}
				onClick={prevSlide}
				sx={{
					position: 'absolute',
					left: isMobile ? '0.5rem' : '2rem',
					top: '40%',
					transform: 'translateY(-50%)',
					zIndex: 3,
					cursor: 'pointer',
					color: 'white',
					'&:hover': { color: '#ff6b35' },
				}}
			>
				<ArrowBack sx={{ fontSize: isMobile ? '1.8rem' : '3rem' }} />
			</Box>

			{/* Navigation — Next */}
			<Box
				component={'div'}
				onClick={nextSlide}
				sx={{
					position: 'absolute',
					right: isMobile ? '0.5rem' : '2rem',
					top: '40%',
					transform: 'translateY(-50%)',
					zIndex: 3,
					cursor: 'pointer',
					color: 'white',
					'&:hover': { color: '#ff6b35' },
				}}
			>
				<ArrowForward sx={{ fontSize: isMobile ? '1.8rem' : '3rem' }} />
			</Box>

			{/* Main text content */}
			<Stack
				key={currentSlide}
				spacing={2}
				sx={{
					position: 'absolute',
					top: isMobile ? '18%' : '40%',
					left: '50%',
					transform: isMobile ? 'translateX(-50%)' : 'translate(-50%, -50%)',
					zIndex: 2,
					textAlign: 'center',
					color: 'white',
					width: '80%',
					px: 4,
					alignItems: 'center',
				}}
			>
				<Typography
					variant="overline"
					sx={{
						color: '#ff6b35',
						letterSpacing: '0.2em',
						fontSize: isMobile ? '0.7rem' : '1rem',
						fontWeight: 500,
						animation: 'fadeInUp 0.6s ease-out',
					}}
				>
					{slides[currentSlide].overline}
				</Typography>
				<Typography
					variant="h1"
					sx={{
						fontSize: { xs: '1.3rem', md: '3.2rem' },
						fontWeight: 300,
						lineHeight: 1.2,
						mb: 2,
						animation: 'fadeInUp 0.6s ease-out 0.1s both',
					}}
				>
					{isMobile ? slides[currentSlide].mobileTitle : slides[currentSlide].title}
				</Typography>
				<Typography
					variant="body1"
					sx={{
						fontSize: isMobile ? '0.72rem' : '1.1rem',
						lineHeight: 1.6,
						color: '#cccccc',
						maxWidth: isMobile ? '260px' : '500px',
						mx: 'auto',
						mb: 3,
						animation: 'fadeInUp 0.6s ease-out 0.2s both',
					}}
				>
					{isMobile ? slides[currentSlide].mobileDescription : slides[currentSlide].description}
				</Typography>
			</Stack>

			{/* Shop Now button */}
			<Box
				component={'div'}
				sx={{
					position: 'absolute',
					bottom: '28%',
					left: '50%',
					transform: 'translateX(-50%)',
					zIndex: 2,
					animation: 'fadeInUp 0.6s ease-out 0.3s both',
				}}
			>
				<Button
					onClick={() => { window.location.href = '/property'; }}
					variant="contained"
					sx={{
						backgroundColor: '#ff6b35',
						color: 'white',
						px: isMobile ? 1.5 : 3,
						py: isMobile ? 0.3 : 0.6,
						borderRadius: '50px',
						fontSize: isMobile ? '0.72rem' : '0.9rem',
						fontWeight: 600,
						textTransform: 'none',
						display: 'flex',
						alignItems: 'center',
						gap: 1,
						'&:hover': {
							backgroundColor: 'white',
							color: '#000000',
							boxShadow: '0 8px 25px rgba(255, 107, 53, 0.3)',
						},
						transition: 'all 0.3s ease',
					}}
				>
					<Box
						component={'div'}
						sx={{
							width: isMobile ? 28 : 40,
							height: isMobile ? 28 : 40,
							borderRadius: '50%',
							backgroundColor: 'white',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							position: 'relative',
							left: isMobile ? -8 : -16,
						}}
					>
						<ArrowBack sx={{ fontSize: '20px', color: '#000000' }} />
					</Box>
					<span style={{ marginLeft: isMobile ? '-4px' : '-8px' }}>{t('Shop Now')}</span>
				</Button>
			</Box>
		</>
	);
};

export default HeroSection;
