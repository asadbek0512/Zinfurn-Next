import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Box, Chip, Button, Link } from '@mui/material';
import { Property } from '../../types/property/property';
import { T } from '../../types/common';
import router from 'next/router';

interface TimeLeft {
	days: number;
	hours: number;
	minutes: number;
	seconds: number;
}

interface FlashSaleCardsProps {
	properties: Property[];
	likePropertyHandler: (user: T, id: string) => void;
}

const FlashSaleCards = ({ properties, likePropertyHandler }: FlashSaleCardsProps) => {
	const getClosestSaleProperties = () => {
		const now = new Date();

		const activeProperties = properties.filter((property: Property) => {
			return (
				property.propertyIsOnSale && property.propertySaleExpiresAt && new Date(property.propertySaleExpiresAt) > now
			);
		});

		return activeProperties
			.sort((a, b) => new Date(a.propertySaleExpiresAt!).getTime() - new Date(b.propertySaleExpiresAt!).getTime())
			.slice(0, 3); // 3 ta kart ko'rsatish
	};

	const [saleProperties, setSaleProperties] = useState<Property[]>([]);
	const [timeLeft, setTimeLeft] = useState<TimeLeft[]>([]);

	// Sale properties ni component mount bo'lganda olish
	useEffect(() => {
		const properties = getClosestSaleProperties();
		setSaleProperties(properties);
	}, [properties]);

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

	// Timer ni har bir property uchun alohida hisoblash
	useEffect(() => {
		if (saleProperties.length === 0) return;

		const updateTimers = () => {
			const newTimeLeft = saleProperties.map((property) => calculateTimeLeft(property.propertySaleExpiresAt!));
			setTimeLeft(newTimeLeft);
		};

		// Dastlab bir marta hisoblash
		updateTimers();

		// Har soniyada yangilash
		const timer = setInterval(updateTimers, 1000);

		return () => clearInterval(timer);
	}, [saleProperties]);

	const formatTime = (time: number) => {
		return time.toString().padStart(2, '0');
	};

	// Safe calculation with default values
	const calculateSalePercentage = (originalPrice?: number, salePrice?: number) => {
		if (!originalPrice || !salePrice || originalPrice <= salePrice) {
			return 0;
		}
		return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
	};

	const handleViewDetails = (id: string) => {
		router.push({ pathname: '/property/detail', query: { id } });

	};

	if (saleProperties.length === 0) {
		return (
			<Box component={'div'} className="flash-sale-empty">
				<Typography variant="h6">Hozirda flash sale mavjud emas</Typography>
				<Typography variant="body2">Tez orada yangi takliflar bilan qaytamiz!</Typography>
			</Box>
		);
	}

	return (
		<Box component={'div'} className="flash-sale-container">
			{/* Header */}
			<Box component={'div'} className="flash-sale-header">
				<Box component={'div'} className="header-content">
					<Box component={'div'} className="header-icon">
						<Typography>⚡</Typography>
					</Box>
					<Typography variant="h4" className="header-title">
						Flash Sale!
					</Typography>
				</Box>
				<Link href="/property" className="view-button">
					All Properties
				</Link>
			</Box>

			{/* 3 ta Banner */}
			<Box component={'div'} className="triple-banner-container">
				{saleProperties.map((property, index) => (
					<Box
						key={property._id || index}
						component={'div'}
						className="banner-item"
						onClick={() => handleViewDetails(property._id)}
						style={{ cursor: 'pointer' }}
					>
						<Box
							component="div"
							className="banner-bg"
							sx={{
								backgroundImage: `url(${process.env.REACT_APP_API_URL}/${property.propertyImages?.[0]})`,
							}}
						/>
						<Box component={'div'} className="banner-overlay" />
						<Box component={'div'} className="banner-content">
							<Box component={'div'} className="exclusive-badge">
								<Typography className="exclusive-text">Exclusive Offer</Typography>
								<Chip
									label={`${calculateSalePercentage(property.propertyPrice, property.propertySalePrice)}% OFF`}
									className="percentage-chip"
								/>
							</Box>

							{/* Katta Timer - Markazda - Har bir property uchun alohida */}
							<Box component={'div'} className="main-timer">
								<Box component={'div'} className="timer-large">
									<Typography className="timer-label-large">Days</Typography>
									<Typography className="timer-value-large">{formatTime(timeLeft[index]?.days || 0)}</Typography>
								</Box>
								<Typography className="timer-sep-large">:</Typography>
								<Box component={'div'} className="timer-large">
									<Typography className="timer-label-large">Hours</Typography>
									<Typography className="timer-value-large">{formatTime(timeLeft[index]?.hours || 0)}</Typography>
								</Box>
								<Typography className="timer-sep-large">:</Typography>
								<Box component={'div'} className="timer-large">
									<Typography className="timer-label-large">Minutes</Typography>
									<Typography className="timer-value-large">{formatTime(timeLeft[index]?.minutes || 0)}</Typography>
								</Box>
							</Box>

							{/* Property Title */}
							<Typography className="property-title">{property.propertyTitle}</Typography>
						</Box>
					</Box>
				))}
			</Box>
		</Box>
	);
};

export default FlashSaleCards;
