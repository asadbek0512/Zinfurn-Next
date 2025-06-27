import React, { useState, useLayoutEffect, useEffect } from 'react';
import { Stack, Typography, Button, Box } from '@mui/material';
import { ArrowBack, ArrowForward } from '@mui/icons-material';
import { useTranslation } from 'next-i18next';

interface Slide {
	overline: string;
	title: string;
	description: string;
	backgroundImage: string;
}

const HeroSection: React.FC = () => {
	const { t } = useTranslation('common');
	const [currentSlide, setCurrentSlide] = useState<number>(0);

	const slides: Slide[] = [
		{
			overline: t('TIMELESS ELEGANCE'),
			title: t("Discover Furniture's For Living"),
			description: t(
				'Consectetur a erat nam at. Facilisis magna etiam tempor orci. Sem et tortor consequat id. Fermentum egestas tellus. Nunc eu hendrerit turpis. Fusce non lectus sem.',
			),
			backgroundImage: '/img/banner/Home-1-.jpg',
		},
		{
			overline: t('SMART SOLUTION'),
			title: t('Enjoy With Style & Comfort'),
			description: t(
				'Feugiat pretium nibh ipsum consequat nisi vel pretium lectus quam. Aliquam ut porttitor leo a diam sollicitudin. Nam at lectus urna duis convallis.',
			),
			backgroundImage: '/img/banner/Home-2-.jpg',
		},
		{
			overline: t('CREATE MEMORIES'),
			title: t("Embrace The Beauty Of Furniture's"),
			description: t(
				'Ut placerat orci nulla pellentesque posuere lorem ipsum dolor. A condimentum vitae sapien pellentesque habitant morbi tristique senectus.',
			),
			backgroundImage: '/img/banner/Home-3-.jpg',
		},
	];

	// updateHeaderBackground uchun aniq tip
	const updateHeaderBackground = (slideIndex: number): void => {
		const header = document.querySelector('.header-main');
		if (header) {
			header.classList.remove('slide-0', 'slide-1', 'slide-2');
			header.classList.add(`slide-${slideIndex}`);
		}
	};

	const nextSlide = (): void => {
		const newSlide = (currentSlide + 1) % slides.length;
		setCurrentSlide(newSlide);
		updateHeaderBackground(newSlide);
	};

	const prevSlide = (): void => {
		const newSlide = (currentSlide - 1 + slides.length) % slides.length;
		setCurrentSlide(newSlide);
		updateHeaderBackground(newSlide);
	};

	const handleClick = (): void => {
		window.location.href = '/property';
	};

	// currentSlide o'zgarganda darhol background yangilanadi
	useLayoutEffect(() => {
		updateHeaderBackground(currentSlide);
	}, [currentSlide]);

	// Avtomatik slayd o'zgarishi (10 soniya)
	useEffect(() => {
		const interval = setInterval(() => {
			setCurrentSlide((prevSlide) => {
				const newSlide = (prevSlide + 1) % slides.length;
				updateHeaderBackground(newSlide);
				return newSlide;
			});
		}, 10000);

		return () => clearInterval(interval);
	}, [slides.length]);

	return (
		<Box
			component={'div'}
			sx={{
				position: 'relative',
				height: '100vh',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				overflow: 'hidden',
				marginTop: '20px',
				zIndex: 10,
				backgroundColor: 'transparent',
				
				
			}}
		>
			{/* Navigation Arrows */}
			<Box
				component={'div'}
				sx={{
					position: 'absolute',
					left: '2rem',
					top: '50%',
					transform: 'translateY(-50%)',
					zIndex: 3,
					cursor: 'pointer',
					color: 'white',
					'&:hover': {
						color: '#ff6b35',
					},
				}}
				className="hero-prev"
				onClick={prevSlide}
			>
				<ArrowBack sx={{ fontSize: '3rem' }} />
			</Box>
			<Box
				component={'div'}
				sx={{
					position: 'absolute',
					right: '2rem',
					top: '50%',
					transform: 'translateY(-50%)',
					zIndex: 3,
					cursor: 'pointer',
					color: 'white',
					'&:hover': {
						color: '#ff6b35',
					},
				}}
				className="hero-next"
				onClick={nextSlide}
			>
				<ArrowForward sx={{ fontSize: '3rem' }} />
			</Box>

			{/* Main Content */}
			<Stack
				sx={{
					position: 'relative',
					zIndex: 2,
					textAlign: 'center',
					color: 'white',
					maxWidth: '90%',
					width: '100%',
					px: 4,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					transform: 'translateY(-10px)',
					opacity: 1,
					transition: 'all 0.3s ease-in-out',
				}}
				spacing={2}
				key={currentSlide}
			>
				<Typography
					variant="overline"
					sx={{
						color: '#ff6b35',
						letterSpacing: '0.2em',
						fontSize: '1rem',
						fontWeight: 500,
						animation: 'fadeInUp 0.6s ease-out',
					}}
				>
					{slides[currentSlide].overline}
				</Typography>
				<Typography
					variant="h1"
					sx={{
						fontSize: { xs: '1.8rem', md: '3.2rem' },
						fontWeight: 300,
						lineHeight: 1.2,
						mb: 2,
						animation: 'fadeInUp 0.6s ease-out 0.1s both',
					}}
				>
					{slides[currentSlide].title}
				</Typography>
				<Typography
					variant="body1"
					sx={{
						fontSize: '1.1rem',
						lineHeight: 1.6,
						color: '#cccccc',
						maxWidth: '500px',
						mx: 'auto',
						mb: 3,
						animation: 'fadeInUp 0.6s ease-out 0.2s both',
					}}
				>
					{slides[currentSlide].description}
				</Typography>
				<Box
					component={'div'}
					sx={{
						animation: 'fadeInUp 0.6s ease-out 0.3s both',
					}}
				>
					<style>
						{`
              @keyframes fadeInUp {
                0% { opacity: 0; transform: translateY(30px); }
                100% { opacity: 1; transform: translateY(0); }
              }
              @keyframes slideOut {
                0% { transform: translateX(0); }
                100% { transform: translateX(-50px); opacity: 0; }
              }
              @keyframes slideIn {
                0% { transform: translateX(50px); opacity: 0; }
                100% { transform: translateX(0); opacity: 1; }
              }
            `}
					</style>
					<Button
						onClick={handleClick}
						variant="contained"
						sx={{
							backgroundColor: '#ff6b35',
							color: 'white',
							px: 3,
							py: 0.6,
							borderRadius: '50px',
							fontSize: '0.9rem',
							fontWeight: 600,
							textTransform: 'none',
							display: 'flex',
							alignItems: 'center',
							gap: 1,
							'&:hover': {
								backgroundColor: 'white',
								borderColor: '#ff6b35',
								color: '#000000',
								boxShadow: '0 8px 25px rgba(255, 107, 53, 0.3)',
								'& .arrow-circle': {
									backgroundColor: '#ff6b35',
									'& .arrow-icon': {
										color: 'white',
										transform: 'translateX(-50px)',
										animation: 'slideOut 0.1s ease-out forwards, slideIn 0.2s ease-in 0.1s forwards',
									},
								},
							},
							transition: 'all 0.3s ease',
						}}
					>
						<Box
							component={'div'}
							className="arrow-circle"
							sx={{
								width: 40,
								height: 40,
								borderRadius: '50%',
								backgroundColor: 'white',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								transition: 'all 0.3s ease',
								position: 'relative',
								left: -16,
								overflow: 'hidden',
							}}
						>
							<ArrowBack
								className="arrow-icon"
								sx={{
									fontSize: '20px',
									color: '#000000',
									transition: 'all 0.3s ease',
									strokeWidth: 3,
								}}
							/>
						</Box>
						<span style={{ marginLeft: '-8px' }}>{t('Shop Now')}</span>
					</Button>
				</Box>
			</Stack>
		</Box>
	);
};

export default HeroSection;