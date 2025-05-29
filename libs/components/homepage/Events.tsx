import React from 'react';
import { Stack, Box, Button } from '@mui/material';
import { useRouter } from 'next/router';

interface PromoData {
	title: string;
	subtitle: string;
	description: string;
	discount: string;
	buttonText: string;
	imageSrc: string;
	backgroundColor: string;
	isGaming?: boolean;
	filterOption?: string; // Yangi field qo'shdik
}

const promoData: PromoData[] = [
	{
		title: 'Latest Gaming',
		subtitle: 'Chairs',
		description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed',
		discount: 'Flat 20% Discount',
		buttonText: 'Shop Now',
		imageSrc: '/img/banner/game5.png',
		backgroundColor: '#f5f5f5',
		isGaming: true,
		filterOption: 'propertyIsOnSale', // Gaming chairs uchun sale filter
	},
	{
		title: 'Wood Chair',
		subtitle: 'Collection',
		description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed',
		discount: 'Flat 15% Discount',
		buttonText: 'Shop Now',
		imageSrc: '/img/banner/chair3.png',
		backgroundColor: '#f4a92b',
		isGaming: true,
		filterOption: 'propertyIsOnSale', // Wood chairs uchun stock filter
	},
];

const PromoCard = ({ promo }: { promo: PromoData }) => {
	const router = useRouter();

	const handleShopNowClick = () => {
		const filterParams = {
			page: 1,
			limit: 9,
			sort: 'createdAt',
			direction: 'DESC',
			search: {
				options: [promo.filterOption]
			}
		};

		const encodedParams = encodeURIComponent(JSON.stringify(filterParams));
		router.push(`/property?input=${encodedParams}`);
	};

	return (
		<Stack
			className="promo-card"
			style={{
				backgroundColor: promo.backgroundColor,
				position: 'relative',
				borderRadius: '16px',
				padding: '40px 30px',
				minHeight: '300px',
				display: 'flex',
				flexDirection: 'row',
				alignItems: 'center',
				justifyContent: 'space-between',
				overflow: 'hidden',
			}}
		>
			<Box component={'div'} className="promo-content" style={{ flex: 1, zIndex: 2 }}>
				<Box
					component={'div'}
					className="discount-badge"
					style={{
						fontSize: '14px',
						fontWeight: '500',
						color: promo.isGaming ? '#666' : '#8B4513',
						marginBottom: '8px',
					}}
				>
					{promo.discount}
				</Box>

				<Box
					component={'div'}
					className="promo-title"
					style={{
						fontSize: '32px',
						fontWeight: '700',
						lineHeight: '1.2',
						color: promo.isGaming ? '#333' : '#fff',
						marginBottom: '12px',
					}}
				>
					{promo.title}
					<br />
					{promo.subtitle}
				</Box>

				<Box
					component={'div'}
					className="promo-description"
					style={{
						fontSize: '14px',
						fontWeight: '400',
						color: promo.isGaming ? '#666' : 'rgba(255,255,255,0.9)',
						marginBottom: '24px',
						lineHeight: '1.5',
						maxWidth: '250px',
					}}
				>
					{promo.description}
				</Box>

				<Button
					className="shop-button"
					onClick={handleShopNowClick}
					style={{
						backgroundColor: '#4a6741',
						color: '#fff',
						padding: '12px 24px',
						borderRadius: '25px',
						fontSize: '14px',
						fontWeight: '500',
						textTransform: 'none',
						border: 'none',
						cursor: 'pointer',
						display: 'flex',
						alignItems: 'center',
						gap: '8px',
					}}
				>
					{promo.buttonText}
					<span style={{ fontSize: '16px' }}>→</span>
				</Button>
			</Box>

			<Box
				component={'div'}
				className="promo-image"
				style={{
					position: 'absolute',
					right: '-70px',
					top: '56%',
					transform: 'translateY(-50%)',
					width: '350px',
					height: '850px',
					backgroundImage: `url(${promo.imageSrc})`,
					backgroundSize: 'contain',
					backgroundRepeat: 'no-repeat',
					backgroundPosition: 'center',
					zIndex: 1,
				}}
			/>
		</Stack>
	);
};

const PromoBanners = () => {
	return (
		<Stack className="promo-banners" style={{ padding: '40px 0' }}>
			<Stack className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
				<Stack
					className="banners-wrapper"
					style={{
						display: 'grid',
						gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
						gap: '24px',
						width: '100%',
					}}
				>
					{promoData.map((promo: PromoData, index: number) => (
						<PromoCard promo={promo} key={index} />
					))}
				</Stack>
			</Stack>
		</Stack>
	);
};

export default PromoBanners;