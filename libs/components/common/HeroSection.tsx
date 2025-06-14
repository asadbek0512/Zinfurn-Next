import React, { useState } from 'react';
import { Stack, Typography, Button, Box } from '@mui/material';
import { ArrowBack, ArrowForward } from '@mui/icons-material';

const HeroSection = () => {
	const [currentSlide, setCurrentSlide] = useState(0);

	const slides = [
		{
			overline: "TIMELESS ELEGANCE",
			title: "Discover Furniture's For Living",
			description: "Consectetur a erat nam at. Facilisis magna etiam tempor orci. Sem et tortor consequat id. Fermentum egestas tellus. Nunc eu hendrerit turpis. Fusce non lectus sem."
		},
		{
			overline: "SMART SOLUTION",
			title: "Enjoy With Style & Comfort",
			description: "Feugiat pretium nibh ipsum consequat nisi vel pretium lectus quam. Aliquam ut porttitor leo a diam sollicitudin. Nam at lectus urna duis convallis. "
		},
		{
			overline: "CREATE MEMORIES",
			title: "Embrace The Beauty Of Furniture's",
			description: "Ut placerat orci nulla pellentesque posuere lorem ipsum dolor. A condimentum vitae sapien pellentesque habitant morbi tristique senectus."
		}
	];

	const nextSlide = () => {
		setCurrentSlide((prev) => (prev + 1) % slides.length);
	};

	const prevSlide = () => {
		setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
	};

	return (
		<Box
			component={'div'}
			sx={{
				position: 'relative',
				height: '300vh',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				overflow: 'hidden',
				transform: 'translateY(-70px)', // 30px yuqoriga ko'tarish
			}}
		>
			{/* Background Image Only */}
			<Box
				component={'div'}
				sx={{
					position: 'absolute',
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					backgroundImage: 'url(/path-to-your-furniture-image.jpg)', // O'zingizning rasm yo'lingizni qo'ying
					backgroundSize: 'cover',
					backgroundPosition: 'center',
					backgroundRepeat: 'no-repeat',
				}}
			/>
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
			{/* Main Content - YOZUVLAR KICHRAYTIRILDI */}
			<Stack
				sx={{
          position: 'relative',
          zIndex: 2,
          textAlign: 'center', // MARKAZ
          color: 'white',
          maxWidth: '90%', // KENGAYTIRILDI: 800px dan 90% ga
          width: '100%', // QO'SHILDI: to'liq kenglik
          px: 4, // QO'SHILDI: ko'proq padding
          display: 'flex',
          alignItems: 'center', // MARKAZ
          justifyContent: 'center', // MARKAZ
          transform: 'translateY(-10px)' // 30px yuqoriga ko'tarish
           }}
				spacing={2}
			>
				<Typography
					variant="overline"
					sx={{
						color: '#ff6b35',
						letterSpacing: '0.2em',
						fontSize: '1rem', // KICHRAYTIRILDI: 0.9rem dan 0.7rem ga
						fontWeight: 500,
					}}
				>
					{slides[currentSlide].overline}
				</Typography>
				<Typography
					variant="h1"
					sx={{
						fontSize: { xs: '1.8rem', md: '3.2rem' }, // KICHRAYTIRILDI: xs: 2.5rem->1.8rem, md: 4rem->2.5rem
						fontWeight: 300,
						lineHeight: 1.2,
						mb: 2,
					}}
				>
					{slides[currentSlide].title}
				</Typography>
				<Typography
					variant="body1"
					sx={{
						fontSize: '1.1rem', // KICHRAYTIRILDI: 1.1rem dan 0.9rem ga
						lineHeight: 1.6, // KICHRAYTIRILDI: 1.8 dan 1.6 ga
						color: '#cccccc',
						maxWidth: '500px', // KICHRAYTIRILDI: 600px dan 500px ga
						mx: 'auto',
						mb: 3,
					}}
				>
					{slides[currentSlide].description}
				</Typography>
        <Box component={'div'}>
					<Button
						variant="contained"
						sx={{
							backgroundColor: '#ff6b35',
							color: 'white',
							px: 3,
							py: 1.2,
							borderRadius: '50px',
							fontSize: '0.9rem',
							fontWeight: 500,
							textTransform: 'none',
							display: 'flex',
							alignItems: 'center',
							gap: 1,
							'&:hover': {
								backgroundColor: 'white',
								borderColor: '#ff6b35',
								color: '#ff6b35',
								transform: 'translateY(-2px)',
								boxShadow: '0 8px 25px rgba(255, 107, 53, 0.3)',
								'& .arrow-circle': {
									backgroundColor: '#ff6b35',
									'& .arrow-icon': {
										color: 'white',
										transform: 'rotate(0deg)',
									},
								},
							},
							transition: 'all 0.3s ease',
						}}
					>
						<Box component={'div'}
							className="arrow-circle"
							sx={{
								width: 32,
								height: 32,
								borderRadius: '50%',
								backgroundColor: 'white',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								transition: 'all 0.3s ease',
							}}
						>
							<ArrowBack 
								className="arrow-icon"
								sx={{
									fontSize: '16px',
									color: '#ff6b35',
									transform: 'rotate(180deg)',
									transition: 'all 0.3s ease',
								}}
							/>
						</Box>
						Shop Now
					</Button>
				</Box>
			</Stack>

			{/* PAGINATION (NUQTALAR) OLIB TASHLANDI */}
			{/* Bu qism butunlay o'chirildi */}
		</Box>
	);
};
export default HeroSection;