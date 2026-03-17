import React, { useEffect, useState } from 'react';
import { Box, Typography, Container } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { useRouter } from 'next/router';

// Styled Components
const ToastContainer = styled(Box)(({ theme }) => ({
	position: 'fixed',
	top: '80px',
	left: '50%',
	transform: 'translateX(-50%)',
	width: '90%',
	maxWidth: '600px',
	backgroundColor: '#2A2A2A',
	borderRadius: '10px',
	padding: '20px 24px',
	display: 'flex',
	alignItems: 'center',
	gap: '16px',
	zIndex: 9998,
	boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
	border: '1px solid rgba(255, 255, 255, 0.15)',
	cursor: 'pointer',
	transition: 'all 0.2s ease',
	'&:hover': {
		backgroundColor: '#333333',
		boxShadow: '0 12px 32px rgba(0, 0, 0, 0.3)',
		transform: 'translateX(-50%) translateY(-2px)',
	},
	[theme.breakpoints.down('sm')]: {
		width: '85%',
		top: '70px',
		padding: '16px 18px',
		maxWidth: '400px',
	},
}));

const IconBox = styled(Box)({
	width: '40px',
	height: '40px',
	borderRadius: '8px',
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	flexShrink: 0,
	backgroundColor: 'rgba(255, 255, 255, 0.1)',
	'& img': {
		width: '24px',
		height: '24px',
		objectFit: 'contain',
		filter: 'brightness(1.1)',
	},
});

const ContentBox = styled(Box)({
	flex: 1,
	display: 'flex',
	flexDirection: 'column',
	gap: '4px',
});

const MessageText = styled(Typography)({
	fontSize: '15px',
	fontWeight: 600,
	lineHeight: 1.3,
	color: '#FFFFFF',
});

const SubtextText = styled(Typography)({
	fontSize: '12px',
	color: 'rgba(255, 255, 255, 0.7)',
	fontWeight: 400,
});

const CloseButton = styled(Box)({
	position: 'absolute',
	top: '8px',
	right: '8px',
	width: '24px',
	height: '24px',
	borderRadius: '50%',
	backgroundColor: 'rgba(255, 255, 255, 0.15)',
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	cursor: 'pointer',
	fontSize: '14px',
	color: '#FFFFFF',
	'&:hover': {
		backgroundColor: 'rgba(255, 255, 255, 0.25)',
	},
});

const LinkAccountToast = () => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [isVisible, setIsVisible] = useState(false);
	const [toastConfig, setToastConfig] = useState<{
		message: string;
		subtext: string;
		icon: string;
	} | null>(null);

	useEffect(() => {
		// Hide on join/login pages
		if (!router.isReady || router.pathname === '/account/join' || router.pathname === '/account/login') {
			setIsVisible(false);
			return;
		}

		// Only show if user is logged in
		if (!user._id) {
			setIsVisible(false);
			return;
		}

		// Check conditions
		const hasGoogleId = !!user.memberGoogleId && user.memberGoogleId.trim() !== '';
		const hasTelegramId = !!user.memberTelegramId && user.memberTelegramId.trim() !== '';

		// Show toast if one exists but not the other
		if (hasGoogleId && !hasTelegramId) {
			setToastConfig({
				message: 'Connect your Telegram account',
				subtext: 'Link Telegram to keep your account secure',
				icon: 'https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg',
			});
			setIsVisible(true);
		} else if (hasTelegramId && !hasGoogleId) {
			setToastConfig({
				message: 'Connect your Google account',
				subtext: 'Link Google to add extra security to your account',
				icon: 'https://developers.google.com/identity/images/g-logo.png',
			});
			setIsVisible(true);
		} else {
			setIsVisible(false);
		}
	}, [user._id, user.memberGoogleId, user.memberTelegramId, router.isReady, router.pathname]);

	const handleClose = (e: React.MouseEvent) => {
		e.stopPropagation();
		setIsVisible(false);
	};

	const handleClick = () => {
		router.push('/mypage?category=myProfile');
	};

	if (!isVisible || !toastConfig) return null;

	return (
		<ToastContainer onClick={handleClick}>
			<CloseButton onClick={handleClose}>×</CloseButton>

			<IconBox>
				<img src={toastConfig.icon} alt="Account icon" />
			</IconBox>

			<ContentBox>
				<MessageText>{toastConfig.message}</MessageText>
				<SubtextText>{toastConfig.subtext}</SubtextText>
			</ContentBox>
		</ToastContainer>
	);
};

export default LinkAccountToast;
