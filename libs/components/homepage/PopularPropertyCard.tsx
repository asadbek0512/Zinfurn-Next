import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Box, Chip, Button, Link } from '@mui/material';
import { useTranslation } from 'next-i18next';
import { Property } from '../../types/property/property';
import { T } from '../../types/common';
import router from 'next/router';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper';

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
	const { t } = useTranslation('common');
	const device = useDeviceDetect();

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

	useEffect(() => {
		if (saleProperties.length === 0) return;

		const updateTimers = () => {
			const newTimeLeft = saleProperties.map((property) => calculateTimeLeft(property.propertySaleExpiresAt!));
			setTimeLeft(newTimeLeft);
		};

		updateTimers();
		const timer = setInterval(updateTimers, 1000);

		return () => clearInterval(timer);
	}, [saleProperties]);

	const formatTime = (time: number) => {
		return time.toString().padStart(2, '0');
	};

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
				<Typography variant="h6">{t('No flash sale available')}</Typography>
				<Typography variant="body2">{t('New offers coming soon')}</Typography>
			</Box>
		);
	}

	if (device === 'mobile') {
		return (
			<div style={{ padding: '16px 0', background: '#ffffff' }}>
				{/* Header */}
				<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 16px 20px' }}>
					<div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
						<span style={{ fontSize: '18px' }}>⚡</span>
						<span style={{ fontSize: '18px', fontWeight: 700, color: '#181a20' }}>{t('Flash Sale!')}</span>
					</div>
					<span
						style={{ fontSize: '12px', color: '#ff6b35', cursor: 'pointer' }}
						onClick={() => router.push('/property')}
					>
						{t('All Furnitures')} →
					</span>
				</div>

				{/* Swiper kartalar */}
				<Swiper slidesPerView={1.5} spaceBetween={10} modules={[Autoplay]} style={{ paddingLeft: '16px', paddingRight: '8px' }}>
					{saleProperties.map((property, index) => {
						const pct = calculateSalePercentage(property.propertyPrice, property.propertySalePrice);
						const imgUrl = `${process.env.REACT_APP_API_URL}/${property.propertyImages?.[0]}`;
						const tl = timeLeft[index] || { days: 0, hours: 0, minutes: 0, seconds: 0 };
						const timerItems = [
							{ label: t('Days'), val: tl.days },
							{ label: t('Hours'), val: tl.hours },
							{ label: t('Min'), val: tl.minutes },
							{ label: t('Sec'), val: tl.seconds },
						];
						return (
							<SwiperSlide key={property._id || index}>
								<div
									style={{ borderRadius: '14px', overflow: 'hidden', cursor: 'pointer', position: 'relative', height: '220px' }}
									onClick={() => handleViewDetails(property._id)}
								>
									{/* Rasm */}
									<img src={imgUrl} alt={property.propertyTitle}
										style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
									{/* Overlay */}
									<div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)' }} />

									{/* Content */}
									<div style={{ position: 'absolute', inset: 0, zIndex: 2, display: 'flex', flexDirection: 'column', padding: '10px' }}>
										{/* Badge - yuqori */}
										<div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
											<span style={{ color: '#fff', fontSize: '12px', fontWeight: 500 }}>{t('Exclusive Offer')}</span>
											{pct > 0 && (
												<span style={{ background: '#f18745', color: '#fff', fontSize: '12px', fontWeight: 700, padding: '3px 10px', borderRadius: '10px' }}>
													{pct}% {t('OFF')}
												</span>
											)}
										</div>

										{/* Taymer - o'rta */}
										<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginTop: 'auto', marginBottom: '35px', background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(8px)', borderRadius: '14px', padding: '10px 12px' }}>
											{timerItems.map((item, i) => (
												<React.Fragment key={i}>
													<div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.15)', borderRadius: '8px', padding: '7px 6px', minWidth: '32px', backdropFilter: 'blur(5px)', border: '1px solid rgba(255,255,255,0.2)' }}>
														<div style={{ fontSize: '13px', fontWeight: 800, color: '#eee', lineHeight: 1 }}>{formatTime(item.val)}</div>
														<div style={{ fontSize: '7px', color: 'rgba(255,255,255,0.8)', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>{item.label}</div>
													</div>
													{i < 3 && <span style={{ color: '#e4e4e4', fontWeight: 800, fontSize: '13px' }}>:</span>}
												</React.Fragment>
											))}
										</div>

										{/* Nom - past */}
										<div style={{ fontSize: '13px', color: '#fff', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '4px' }}>
											{property.propertyTitle}
										</div>
									</div>
								</div>
							</SwiperSlide>
						);
					})}
				</Swiper>
			</div>
		);
	}

	return (
		<Box component={'div'} className="flash-sale-container">
			<Box component={'div'} className="flash-sale-header">
				<Box component={'div'} className="header-content">
					<Box component={'div'} className="header-icon">
						<Typography>⚡</Typography>
					</Box>
					<Typography variant="h4" className="header-title">
						{t('Flash Sale!')}
					</Typography>
				</Box>
				<Link href="/property" className="view-button">
					{t('All Properties')}
				</Link>
			</Box>

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
								<Typography className="exclusive-text">{t('Exclusive Offer')}</Typography>
								<Chip
									label={`${calculateSalePercentage(property.propertyPrice, property.propertySalePrice)}% ${t('OFF')}`}
									className="percentage-chip"
								/>
							</Box>

							<Box component={'div'} className="main-timer">
								<Box component={'div'} className="timer-large">
									<Typography className="timer-label-large">{t('Days')}</Typography>
									<Typography className="timer-value-large">{formatTime(timeLeft[index]?.days || 0)}</Typography>
								</Box>
								<Typography className="timer-sep-large">:</Typography>
								<Box component={'div'} className="timer-large">
									<Typography className="timer-label-large">{t('Hours')}</Typography>
									<Typography className="timer-value-large">{formatTime(timeLeft[index]?.hours || 0)}</Typography>
								</Box>
								<Typography className="timer-sep-large">:</Typography>
								<Box component={'div'} className="timer-large">
									<Typography className="timer-label-large">{t('Minutes')}</Typography>
									<Typography className="timer-value-large">{formatTime(timeLeft[index]?.minutes || 0)}</Typography>
								</Box>
								<Typography className="timer-sep-large">:</Typography>
								<Box component={'div'} className="timer-large">
									<Typography className="timer-label-large">{t('Seconds')}</Typography>
									<Typography className="timer-value-large">{formatTime(timeLeft[index]?.seconds || 0)}</Typography>
								</Box>
							</Box>

							<Typography className="property-title">{property.propertyTitle}</Typography>
						</Box>
					</Box>
				))}
			</Box>
		</Box>
	);
};

export default FlashSaleCards;
