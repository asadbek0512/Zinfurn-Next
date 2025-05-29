import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Stack, Box, Button, Typography } from '@mui/material';
import { useQuery } from '@apollo/client';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Member } from '../../types/member/member';
import { AgentsInquiry } from '../../types/member/member.input';
import { T } from '../../types/common';
import { GET_TECHNICIANS } from '../../../apollo/user/query';
import { ArrowRight, CheckCircle, Leaf, Shield, Star } from 'phosphor-react';
import HandymanIcon from '@mui/icons-material/Handyman';
import BuildIcon from '@mui/icons-material/Build';
import DesignServicesIcon from '@mui/icons-material/DesignServices';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import StarIcon from '@mui/icons-material/Star';
import StarHalfIcon from '@mui/icons-material/StarHalf';
import StarOutlineIcon from '@mui/icons-material/StarOutline';

interface QualitySectionProps {
	initialInput?: AgentsInquiry;
}

const QualitySection: React.FC<QualitySectionProps> = ({ initialInput }) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const [isVisible, setIsVisible] = useState(false);
	const [topTechnician, setTopTechnician] = useState<Member | null>(null);

	useEffect(() => {
		const timer = setTimeout(() => setIsVisible(true), 100);
		return () => clearTimeout(timer);
	}, []);

	/** APOLLO REQUESTS **/
	const {
		loading: loadingTechnicians,
		data: techniciansData,
		error: techniciansError,
		refetch: refetchTechnicians,
	} = useQuery(GET_TECHNICIANS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: initialInput },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			const technicians = data?.getTechnicians?.list;
			if (technicians && technicians.length > 0) {
				// Eng yuqori reytingli technicianini olish
				setTopTechnician(technicians[0]);
			}
		},
	});

	const technicianImage = topTechnician?.memberImage
		? `${process.env.REACT_APP_API_URL}/${topTechnician.memberImage}`
		: '/img/profile/defaultUser.svg';

	const technicianName = topTechnician?.memberNick || 'Professional Craftsperson';

	const features = [
		{
			icon: HandymanIcon,
			title: 'Reliable Repairs',
			description: 'Strong, stable, and long-lasting fixes for all furniture types.',
			color: 'blue',
		},
		{
			icon: BuildIcon,
			title: 'Detailed Restoration',
			description: 'We restore furniture to its original beauty, preserving its character.',
			color: 'green',
		},
		{
			icon: DesignServicesIcon,
			title: 'Custom Solutions',
			description: 'We design and build furniture tailored to your needs.',
			color: 'orange',
		},
		{
			icon: ThumbUpAltIcon,
			title: 'Trusted by Clients',
			description: 'Over 10 years of experience and dozens of satisfied customers.',
			color: 'purple',
		},
	];

	const stats = [
		{ number: '10+', label: 'Years of Professional Repair Experience' },
		{ number: '12K+', label: 'Satisfied Clients Served' },
		{ number: '500+', label: 'Furniture Projects Handled' },
		{ number: '99%', label: 'Client Satisfaction Rate' },
	];

	const rating = 4.5;

	function renderStars(rating: number) {
		const stars = [];
		for (let i = 1; i <= 5; i++) {
			if (rating >= i) {
				stars.push(<StarIcon key={i} className="star-icon" />);
			} else if (rating + 0.5 >= i) {
				stars.push(<StarHalfIcon key={i} className="star-icon" />);
			} else {
				stars.push(<StarOutlineIcon key={i} className="star-icon" />);
			}
		}
		return stars;
	}

	// Loading holatini ko'rsatish
	if (loadingTechnicians) {
		return (
			<Stack className="quality-section loading">
				<Box component="div" className="loading-spinner">
					Loading...
				</Box>
			</Stack>
		);
	}

	return (
		<Stack className={`quality-section ${isVisible ? 'visible' : ''}`}>
			<Box component="div" className="quality-container">
				{/* Main Content Grid */}
				<Box component="div" className="main-content-grid">
					{/* Image Section */}
					<Box component="div" className="image-section">
						<Box component="div" className="image-wrapper">
							{/* Background decoration */}
							<Box component="div" className="bg-decoration"></Box>

							{/* Main image container */}
							<Box component="div" className="image-container">
								<img
									src={technicianImage}
									alt={`Professional furniture craftsperson - ${technicianName}`}
									className="main-image"
								/>

								{/* Overlay gradient */}
								<Box component="div" className="overlay-gradient"></Box>

								{/* Decorative border */}
								<Box component="div" className="decorative-border"></Box>
							</Box>

							{/* Floating quality badge */}
							<Box component="div" className="quality-badge">
								<Box component="div" className="badge-content">
									<Box component="div" className="stars">
										{renderStars(rating)}
									</Box>
									<Typography component="span" className="badge-text">
										Premium Quality
									</Typography>
								</Box>
							</Box>
						</Box>
					</Box>

					{/* Content Section */}
					<Box component="div" className="content-section">
						{/* Header */}
						<Box component="div" className="header-section">
							<Box component="div" className="quality-badge-header">
								<Typography component="span">Our Product Quality</Typography>
							</Box>

							<Typography component="h2" className="main-title">
								Setting the Standard for{' '}
								<Typography component="span" className="gradient-text">
									Quality Furniture
								</Typography>
							</Typography>

							<Typography component="p" className="description">
								Our experienced technicians combine proven skills with practical knowledge to deliver high-quality
								furniture. Every piece is built with care, precision, and attention to detail.
							</Typography>

							{/* Technician Highlight */}
							{topTechnician && (
								<Box component="div" className="technician-highlight">
									<Typography component="p" className="technician-intro">
										This service is led by <strong>{technicianName}</strong>, a professional furniture technician with
										over 10 years of hands-on experience. He specializes in detailed restoration, reliable repairs, and
										custom furniture work trusted by many satisfied clients.
									</Typography>
								</Box>
							)}
						</Box>

						{/* CTA Button */}
						<Box component="div" className="cta-section">
							<Button className="cta-button" onClick={() => router.push('/technicians')}>
								<Typography component="span">Request Repair</Typography>
								<ArrowRight className="arrow-icon" />
							</Button>
						</Box>
					</Box>
				</Box>

				{/* Features Grid */}
				<Box component="div" className="features-section">
					<Box component="div" className="features-header">
						<Typography component="h3" className="features-title">
							Why Choose Our Repair Service?
						</Typography>
						<Typography component="p" className="features-description">
							We blend years of hands-on experience with precise craftsmanship to deliver reliable, long-lasting
							furniture repairs and custom work.
						</Typography>
					</Box>

					<Box component="div" className="features-grid">
						{features.map((feature, index) => {
							const Icon = feature.icon;
							return (
								<Box
									key={feature.title}
									component="div"
									className={`feature-card feature-${feature.color}`}
									style={{ transitionDelay: `${600 + index * 100}ms` }}
								>
									<Box component="div" className="feature-icon">
										{Icon && <Icon className="icon" />}
									</Box>

									<Typography component="h4" className="feature-title">
										{feature.title}
									</Typography>

									<Typography component="p" className="feature-description">
										{feature.description}
									</Typography>
								</Box>
							);
						})}
					</Box>
				</Box>

				{/* Stats Section */}
				<Box component="div" className="stats-section">
					<Box component="div" className="stats-container">
						<Box component="div" className="stats-grid">
							{stats.map((stat, index) => (
								<Box key={stat.label} component="div" className="stat-item">
									<Typography component="div" className="stat-number">
										{stat.number}
									</Typography>
									<Typography component="div" className="stat-label">
										{stat.label}
									</Typography>
								</Box>
							))}
						</Box>
					</Box>
				</Box>
			</Box>
		</Stack>
	);
};

// Default props
QualitySection.defaultProps = {
	initialInput: {
		page: 1,
		limit: 10,
		sort: 'memberRank',
		search: {},
	},
};

export default QualitySection;
