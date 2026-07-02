import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Stack, Box, Button, Typography, Dialog, DialogTitle, DialogContent, DialogActions, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Member } from '../../types/member/member';
import { AgentsInquiry } from '../../types/member/member.input';
import { T } from '../../types/common';
import { GET_TECHNICIANS } from '../../../apollo/user/query';
import { SEND_REPAIR_REQUEST } from '../../../apollo/user/mutation';
import { userVar } from '../../../apollo/store';
import { sweetErrorHandling, sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import { ArrowRight, CheckCircle, Leaf, Shield, Star } from 'phosphor-react';
import HandymanIcon from '@mui/icons-material/Handyman';
import BuildIcon from '@mui/icons-material/Build';
import DesignServicesIcon from '@mui/icons-material/DesignServices';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import StarIcon from '@mui/icons-material/Star';
import StarHalfIcon from '@mui/icons-material/StarHalf';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import { useTranslation, Trans } from 'next-i18next';
import Loading from '../common/Loading';

interface QualitySectionProps {
	initialInput?: AgentsInquiry;
}

const QualitySection: React.FC<QualitySectionProps> = ({ initialInput }) => {
	const { t } = useTranslation('common');
	const device = useDeviceDetect();
	const router = useRouter();
	const [isVisible, setIsVisible] = useState(false);
	const [topTechnician, setTopTechnician] = useState<Member | null>(null);
	const user = useReactiveVar(userVar);

	// repair request modal
	const [repairOpen, setRepairOpen] = useState(false);
	const [reqMessage, setReqMessage] = useState('');
	const [reqAddress, setReqAddress] = useState('');
	const [reqPhone, setReqPhone] = useState('');
	const [submitting, setSubmitting] = useState(false);
	const [sendRepairRequest] = useMutation(SEND_REPAIR_REQUEST);

	useEffect(() => {
		const timer = setTimeout(() => setIsVisible(true), 100);
		return () => clearTimeout(timer);
	}, []);

	const openRepairModal = () => {
		if (!user?._id) {
			sweetMixinErrorAlert(t('Please login to request a repair')).then();
			return;
		}
		if (!topTechnician?._id) return;
		setRepairOpen(true);
	};

	const submitRepairRequest = async () => {
		if (!reqMessage.trim() || !topTechnician?._id) {
			await sweetMixinErrorAlert(t('Please describe the problem'));
			return;
		}
		setSubmitting(true);
		try {
			await sendRepairRequest({
				variables: {
					input: {
						technicianId: topTechnician._id,
						message: reqMessage,
						address: reqAddress || undefined,
						phone: reqPhone || undefined,
					},
				},
			});
			setRepairOpen(false);
			setReqMessage('');
			setReqAddress('');
			sweetTopSmallSuccessAlert(t('Repair request sent to the technician!'), 2000);
		} catch (err) {
			await sweetErrorHandling(err);
		} finally {
			setSubmitting(false);
		}
	};

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
				setTopTechnician(technicians[0]);
			}
		},
	});

	const technicianImage = topTechnician?.memberImage
		? (topTechnician.memberImage.startsWith('http') ? topTechnician.memberImage : `${process.env.REACT_APP_API_URL}/${topTechnician.memberImage}`)
		: '/img/profile/defaultUser.svg';

	const technicianName = topTechnician?.memberNick || t('Professional Craftsperson');

	const features = [
		{
			icon: HandymanIcon,
			title: t('Reliable Repairs'),
			description: t('Strong, stable, and long-lasting fixes for all furniture types.'),
			color: 'blue',
		},
		{
			icon: BuildIcon,
			title: t('Detailed Restoration'),
			description: t('We restore furniture to its original beauty, preserving its character.'),
			color: 'green',
		},
		{
			icon: DesignServicesIcon,
			title: t('Custom Solutions'),
			description: t('We design and build furniture tailored to your needs.'),
			color: 'orange',
		},
		{
			icon: ThumbUpAltIcon,
			title: t('Trusted by Clients'),
			description: t('Over 10 years of experience and dozens of satisfied customers.'),
			color: 'purple',
		},
	];

	const stats = [
		{ number: '10+', label: t('Years of Professional Repair Experience') },
		{ number: '12K+', label: t('Satisfied Clients Served') },
		{ number: '500+', label: t('Furniture Projects Handled') },
		{ number: '99%', label: t('Client Satisfaction Rate') },
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

	if (loadingTechnicians) {
		return <Loading />;
	}

	if (device === 'mobile') {
		return (
			<div className="mob-quality-section">
				{/* Hero rasm + overlay + matn */}
				<div className="mob-quality-hero-wrap">
					<img src={technicianImage} alt={technicianName} className="mob-quality-hero-img" />
					<div className="mob-quality-hero-overlay" />
					<div className="mob-quality-hero-text">
						<h2 className="mob-quality-hero-title">{t('Service Page')}</h2>
						<p className="mob-quality-hero-desc">{t('Home / For Repair')}</p>
					</div>
				</div>

				{/* Badge — yarmi rasimda, yarmi tashqarida, o'ng tomonda */}
				<div className="mob-quality-badge-float">
					<span className="mob-quality-hero-badge">⭐ {t('Premium Quality')}</span>
				</div>

				{/* Sarlavha + tavsif */}
				<div className="mob-quality-desc">
					<p className="mob-quality-header-label">{t('Our Product Quality')}</p>
					<h2 className="mob-quality-title">
						{t('Home to Repair')} <span>{t('Quality Furniture')}</span>
					</h2>
					<p className="mob-quality-text">
						{t('Our experienced technicians combine proven skills with practical knowledge to deliver high-quality furniture. Every piece is built with care, precision, and attention to detail.')}
					</p>
				</div>

				{/* Stats */}
				<div className="mob-quality-stats">
					{stats.map((stat) => (
						<div key={stat.label} className="mob-quality-stat">
							<span className="mob-quality-stat-num">{stat.number}</span>
							<span className="mob-quality-stat-label">{stat.label}</span>
						</div>
					))}
				</div>

				{/* Features */}
				<div className="mob-quality-features">
					<p className="mob-quality-features-title">{t('Why Choose Our Repair Service?')}</p>
					<div className="mob-quality-features-grid">
						{features.map((feature) => {
							const Icon = feature.icon;
							return (
								<div key={feature.title} className="mob-quality-feature-card">
									<div className={`mob-quality-feature-icon ${feature.color}`}>
										{Icon && <Icon className="icon" />}
									</div>
									<p className="mob-quality-feature-title">{feature.title}</p>
									<p className="mob-quality-feature-desc">{feature.description}</p>
								</div>
							);
						})}
					</div>
				</div>
			</div>
		);
	}

	return (
		<>
		<Stack className={`quality-section ${isVisible ? 'visible' : ''}`}>
			<Box component="div" className="quality-container">
				{/* Main Content Grid */}
				<Box component="div" className="main-content-grid">
					{/* Image Section */}
					<Box component="div" className="image-section">
						<Box component="div" className="image-wrapper">
							<Box component="div" className="bg-decoration"></Box>
							<Box component="div" className="image-container">
								<img
									src={technicianImage}
									alt={t('Professional furniture craftsperson - {{name}}', { name: technicianName })}
									className="main-image"
								/>
								<Box component="div" className="overlay-gradient"></Box>
								<Box component="div" className="decorative-border"></Box>
							</Box>
							<Box component="div" className="quality-badge">
								<Box component="div" className="badge-content">
									<Box component="div" className="stars">
										{renderStars(rating)}
									</Box>
									<Typography component="span" className="badge-text">
										{t('Premium Quality')}
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
								<Typography component="span">{t('Our Product Quality')}</Typography>
							</Box>

							<Typography component="h2" className="main-title">
								{t('Setting the Standard for')}{' '}
								<Typography component="span" className="gradient-text">
									{t('Quality Furniture')}
								</Typography>
							</Typography>

							<Typography component="p" className="description">
								{t(
									'Our experienced technicians combine proven skills with practical knowledge to deliver high-quality furniture. Every piece is built with care, precision, and attention to detail.',
								)}
							</Typography>

							{topTechnician && (
								<Box component="div" className="technician-highlight">
									<Typography component="p" className="technician-intro">
										<Trans
											i18nKey="This service is led by <strong>{{name}}</strong>, a professional furniture technician with over 10 years of hands-on experience. He specializes in detailed restoration, reliable repairs, and custom furniture work trusted by many satisfied clients."
											components={{ strong: <strong /> }}
											values={{ name: technicianName }}
										/>
									</Typography>
								</Box>
							)}
						</Box>

						{/* CTA Button */}
						<Box component="div" className="cta-section">
							<Button className="cta-button" onClick={openRepairModal}>
								<Typography component="span">{t('Request Repair')}</Typography>
								<ArrowRight className="arrow-icon" />
							</Button>
						</Box>
					</Box>
				</Box>

				{/* Features Grid */}
				<Box component="div" className="features-section">
					<Box component="div" className="features-header">
						<Typography component="h3" className="features-title">
							{t('Why Choose Our Repair Service?')}
						</Typography>
						<Typography component="p" className="features-description">
							{t(
								'We blend years of hands-on experience with precise craftsmanship to deliver reliable, long-lasting furniture repairs and custom work.',
							)}
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
							{stats.map((stat) => (
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

		<Dialog open={repairOpen} onClose={() => setRepairOpen(false)} maxWidth="sm" fullWidth>
			<DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
				{t('Request a Repair')}
				<IconButton onClick={() => setRepairOpen(false)} size="small"><CloseIcon /></IconButton>
			</DialogTitle>
			<DialogContent>
				<Typography sx={{ fontSize: 14, color: 'var(--text-2)', mb: 2 }}>
					{t('Send your repair request to')} <strong>{technicianName}</strong>
				</Typography>
				<div className="repair-req-field">
					<label>{t('Describe the problem')}</label>
					<textarea
						placeholder={t('e.g. My wooden chair leg is broken...')}
						value={reqMessage}
						onChange={(e) => setReqMessage(e.target.value)}
						rows={3}
					/>
				</div>
				<div className="repair-req-field">
					<label>{t('Address')}</label>
					<input type="text" placeholder={t('Enter your address')} value={reqAddress} onChange={(e) => setReqAddress(e.target.value)} />
				</div>
				<div className="repair-req-field">
					<label>{t('Phone')}</label>
					<input type="text" placeholder={t('Enter your phone')} value={reqPhone} onChange={(e) => setReqPhone(e.target.value)} />
				</div>
			</DialogContent>
			<DialogActions sx={{ px: 3, pb: 2 }}>
				<Button onClick={() => setRepairOpen(false)} sx={{ color: 'var(--text-3)' }}>{t('Cancel')}</Button>
				<Button onClick={submitRepairRequest} disabled={submitting || !reqMessage.trim()} variant="contained" sx={{ background: 'var(--primary)', '&:hover': { background: 'var(--primary-dark)' } }}>
					{submitting ? t('Sending...') : t('Send Request')}
				</Button>
			</DialogActions>
		</Dialog>
		</>
	);
};

QualitySection.defaultProps = {
	initialInput: {
		page: 1,
		limit: 10,
		sort: 'memberRank',
		search: {},
	},
};

export default QualitySection;
