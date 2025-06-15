import React, { useEffect, useState } from 'react';
import { Box, Typography, Avatar } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { Property } from '../../types/property/property';
import { PropertiesInquiry } from '../../types/property/property.input';
import { useQuery } from '@apollo/client';
import { GET_PROPERTIES } from '../../../apollo/user/query';
import { T } from '../../types/common';

interface SalesToastProps {
	initialInput: PropertiesInquiry;
}

interface TimeLeft {
	days: number;
	hours: number;
	minutes: number;
	seconds: number;
}

// Global state for toast index - sahifalar o'rtasida saqlanadi
let globalToastIndex = 0;
let globalSaleProperties: Property[] = [];
let lastUpdateTime = 0;

// Animations
const slideIn = keyframes`
	0% {
		transform: translateX(100%);
		opacity: 0;
	}
	100% {
		transform: translateX(0);
		opacity: 1;
	}
`;

const slideOut = keyframes`
	0% {
		transform: translateX(0);
		opacity: 1;
	}
	100% {
		transform: translateX(100%);
		opacity: 0;
	}
`;

// Styled Components
const ToastContainer = styled(Box)(({ theme }) => ({
	position: 'fixed',
	bottom: '24px',
	right: '24px',
	width: '480px', // 400px -> 480px
	backgroundColor: 'rgba(0, 0, 0, 0.9)',
	backdropFilter: 'blur(10px)',
	borderRadius: '16px', // 12px -> 16px
	padding: '24px', // 16px -> 24px
	display: 'flex',
	alignItems: 'center',
	gap: '16px', // 12px -> 16px
	zIndex: 9999,
	boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
	border: '1px solid rgba(255, 255, 255, 0.1)',
	'&.toast-enter': {
		animation: `${slideIn} 0.8s ease-out forwards`,
	},
	'&.toast-exit': {
		animation: `${slideOut} 0.8s ease-out forwards`,
	},
	[theme.breakpoints.down('sm')]: {
		width: '340px', // 320px -> 380px
		right: '12px',
		bottom: '12px',
		padding: '18px', // 16px -> 20px
	},
}));

const ProductImage = styled(Avatar)({
	width: '70px', // 60px -> 80px
	height: '70px', // 60px -> 80px
	borderRadius: '12px', // 8px -> 12px
	'& img': {
		objectFit: 'cover',
	},
});

const ContentBox = styled(Box)({
	flex: 1,
	display: 'flex',
	flexDirection: 'column',
	gap: '5px', // 4px -> 6px
});

const PurchaseText = styled(Typography)({
	color: '#ffffff',
	fontSize: '14px', // 12px -> 14px
	opacity: 0.8,
	fontWeight: 400,
});

const ProductTitle = styled(Typography)({
	color: '#ffffff',
	fontSize: '16px', // 14px -> 16px
	fontWeight: 600,
	lineHeight: 1.3, // 1.2 -> 1.3
	display: '-webkit-box',
	WebkitLineClamp: 2,
	WebkitBoxOrient: 'vertical',
	overflow: 'hidden',
});

const LocationText = styled(Typography)({
	color: '#ffffff',
	fontSize: '13px', // 11px -> 13px
	opacity: 0.7,
	fontWeight: 400,
});

const DiscountBox = styled(Box)({
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'flex-end',
	gap: '6px', // 4px -> 6px
});

const DiscountBadge = styled(Box)(({ theme }) => ({
	backgroundColor: '#ff4757',
	color: '#ffffff',
	padding: '6px 12px', // 4px 8px -> 6px 12px
	borderRadius: '8px', // 6px -> 8px
	fontSize: '14px', // 12px -> 14px
	fontWeight: 700,
	textAlign: 'center',
	minWidth: '60px', // 50px -> 60px
}));

const TimerBox = styled(Box)({
	display: 'flex',
	alignItems: 'center',
	gap: '3px', // 2px -> 3px
	fontSize: '15px', // 13px -> 15px
	color: '#ffffff',
	opacity: 0.8,
	fontWeight: 500, // Added font weight
});

const CloseButton = styled(Box)({
	position: 'absolute',
	top: '4px', // 2px -> 4px
	right: '4px', // 2px -> 4px
	width: '24px', // 20px -> 24px
	height: '24px', // 20px -> 24px
	borderRadius: '50%',
	backgroundColor: 'rgba(255, 255, 255, 0.2)',
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	cursor: 'pointer',
	fontSize: '14px', // 12px -> 14px
	color: '#ffffff',
	'&:hover': {
		backgroundColor: 'rgba(255, 255, 255, 0.3)',
	},
});

const SalesToast = (props: SalesToastProps) => {
	const { initialInput } = props;
	const [saleProperties, setSaleProperties] = useState<Property[]>(globalSaleProperties);
	const [currentToastIndex, setCurrentToastIndex] = useState(globalToastIndex);
	const [isVisible, setIsVisible] = useState(false);
	const [animationClass, setAnimationClass] = useState('');
	const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

	// Apollo Query
	const { data: getPropertiesData } = useQuery(GET_PROPERTIES, {
		fetchPolicy: 'cache-and-network',
		variables: { input: initialInput },
		onCompleted: (data: T) => {
			const properties = data?.getProperties?.list || [];
			const saleProps = getSaleProperties(properties);
			
			// Global state'ni yangilash
			globalSaleProperties = saleProps;
			setSaleProperties(saleProps);
			
			// Agar properties o'zgarmagan bo'lsa, avvalgi index'ni saqlash
			if (saleProps.length > 0 && globalToastIndex >= saleProps.length) {
				globalToastIndex = 0;
				setCurrentToastIndex(0);
			}
		},
		onError: (error) => {
			console.log('SalesToast - Query error:', error);
		},
	});

	const getSaleProperties = (properties: Property[]) => {
		const now = new Date();
		return properties
			.filter((property: Property) => {
				return (
					property.propertyIsOnSale && property.propertySaleExpiresAt && new Date(property.propertySaleExpiresAt) > now
				);
			})
			.sort((a, b) => new Date(a.propertySaleExpiresAt!).getTime() - new Date(b.propertySaleExpiresAt!).getTime());
	};

	const calculateTimeLeft = (targetDate: string | Date) => {
		const now = new Date();
		const target = new Date(targetDate);
		const difference = target.getTime() - now.getTime();

		if (difference > 0) {
			const days = Math.floor(difference / (1000 * 60 * 60 * 24));
			const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
			const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
			const seconds = Math.floor((difference % (1000 * 60)) / 1000);

			return { days, hours, minutes, seconds };
		}
		return { days: 0, hours: 0, minutes: 0, seconds: 0 };
	};

	const calculateSalePercentage = (originalPrice?: number, salePrice?: number) => {
		if (!originalPrice || !salePrice || originalPrice <= salePrice) {
			return 0;
		}
		return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
	};

	const formatTime = (time: number) => {
		return time.toString().padStart(2, '0');
	};

	const showToast = () => {
		if (saleProperties.length === 0) return;

		setAnimationClass('toast-enter');
		setIsVisible(true);

		// Update timer for current property
		const currentProperty = saleProperties[currentToastIndex];
		if (currentProperty?.propertySaleExpiresAt) {
			setTimeLeft(calculateTimeLeft(currentProperty.propertySaleExpiresAt));
		}

		// Hide toast after 5 seconds
		setTimeout(() => {
			setAnimationClass('toast-exit');
			setTimeout(() => {
				setIsVisible(false);
				// Global index'ni yangilash
				globalToastIndex = (globalToastIndex + 1) % saleProperties.length;
				setCurrentToastIndex(globalToastIndex);
			}, 800);
		}, 5000);
	};

	// Show toast every 15 seconds
	useEffect(() => {
		if (saleProperties.length === 0) return;

		const now = Date.now();
		const timeSinceLastUpdate = now - lastUpdateTime;
		
		// Agar komponent yangi yuklangan bo'lsa yoki 15 soniyadan ortiq vaqt o'tgan bo'lsa
		if (lastUpdateTime === 0 || timeSinceLastUpdate >= 15000) {
			// Darhol ko'rsatish
			showToast();
			lastUpdateTime = now;
		} else {
			// Qolgan vaqtni kutish
			const remainingTime = 15000 - timeSinceLastUpdate;
			setTimeout(() => {
				showToast();
				lastUpdateTime = Date.now();
			}, remainingTime);
		}

		// Har 15 soniyada ko'rsatish
		const interval = setInterval(() => {
			showToast();
			lastUpdateTime = Date.now();
		}, 15000);

		return () => clearInterval(interval);
	}, [saleProperties, currentToastIndex]);

	// Update timer every second for current visible toast
	useEffect(() => {
		if (!isVisible || saleProperties.length === 0) return;

		const timer = setInterval(() => {
			const currentProperty = saleProperties[currentToastIndex];
			if (currentProperty?.propertySaleExpiresAt) {
				setTimeLeft(calculateTimeLeft(currentProperty.propertySaleExpiresAt));
			}
		}, 1000);

		return () => clearInterval(timer);
	}, [isVisible, currentToastIndex, saleProperties]);

	const handleClose = () => {
		setAnimationClass('toast-exit');
		setTimeout(() => {
			setIsVisible(false);
		}, 800);
	};

	if (!isVisible || saleProperties.length === 0) return null;

	const currentProperty = saleProperties[currentToastIndex];
	const discountPercentage = calculateSalePercentage(currentProperty.propertyPrice, currentProperty.propertySalePrice);

	return (
		<ToastContainer className={animationClass}>
			<CloseButton onClick={handleClose}>×</CloseButton>

			<ProductImage
				src={`${process.env.REACT_APP_API_URL}/${currentProperty.propertyImages?.[0]}`}
				alt={currentProperty.propertyTitle}
			/>

			<ContentBox>
				<PurchaseText>Someone purchased a</PurchaseText>
				<ProductTitle>{currentProperty.propertyTitle}</ProductTitle>
				<LocationText>Category: {currentProperty.propertyCategory || 'Unknown Category'}</LocationText>
			</ContentBox>

			<DiscountBox>
				{discountPercentage > 0 && <DiscountBadge>{discountPercentage}% OFF</DiscountBadge>}
				<TimerBox>
					{timeLeft.days > 0 && `${formatTime(timeLeft.days)}d `}
					{formatTime(timeLeft.hours)}:{formatTime(timeLeft.minutes)}:{formatTime(timeLeft.seconds)}
				</TimerBox>
			</DiscountBox>
		</ToastContainer>
	);
};

SalesToast.defaultProps = {
	initialInput: {
		page: 1,
		limit: 20,
		sort: 'createdAt',
		direction: 'DESC',
		search: {},
	},
};

export default SalesToast;