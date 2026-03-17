import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { useRouter } from 'next/router';

// Styled Components
const ToastContainer = styled(Box)(({ theme }) => ({
	position: 'fixed',
	bottom: '24px',
	right: '24px',
	width: '240px',
	backgroundColor: '#FFFFFF',
	borderRadius: '12px',
	padding: '16px',
	display: 'flex',
	alignItems: 'center',
	gap: '10px',
	zIndex: 9999,
	boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
	border: '1px solid rgba(255, 165, 0, 0.2)',
	cursor: 'pointer',
	transition: 'all 0.2s ease',
	'&:hover': {
		boxShadow: '0 6px 24px rgba(0, 0, 0, 0.16)',
		transform: 'translateY(-2px)',
	},
	[theme.breakpoints.down('sm')]: {
		width: '220px',
		right: '12px',
		bottom: '12px',
		padding: '12px',
	},
}));

const IconBox = styled(Box)({
	width: '32px',
	height: '32px',
	borderRadius: '6px',
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	flexShrink: 0,
	backgroundColor: '#FFF5E6',
	'& img': {
		width: '20px',
		height: '20px',
		objectFit: 'contain',
	},
});

const ContentBox = styled(Box)({
	flex: 1,
	display: 'flex',
	flexDirection: 'column',
	gap: '2px',
});

const MessageText = styled(Typography)({
	fontSize: '13px',
	fontWeight: 600,
	lineHeight: 1.2,
	color: '#FF9500',
});

const SubtextText = styled(Typography)({
	fontSize: '11px',
	color: '#999999',
	fontWeight: 400,
});

const CloseButton = styled(Box)({
	position: 'absolute',
	top: '4px',
	right: '4px',
	width: '16px',
	height: '16px',
	borderRadius: '50%',
	backgroundColor: 'rgba(255, 165, 0, 0.1)',
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	cursor: 'pointer',
	fontSize: '10px',
	color: '#FF9500',
	'&:hover': {
		backgroundColor: 'rgba(255, 165, 0, 0.2)',
	},
});

const LinkAccountToast = () => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [isVisible, setIsVisible] = useState(false);
	const [toastConfig, setToastConfig] = useState<{
		message: string;
		icon: string;
	} | null>(null);

	useEffect(() => {
		if (!router.isReady || router.pathname === '/account/join') {
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
				icon: 'https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg',
			});
			setIsVisible(true);
		} else if (hasTelegramId && !hasGoogleId) {
			setToastConfig({
				message: 'Connect your Google account',
				icon: 'https://developers.google.com/identity/images/g-logo.png',
			});
			setIsVisible(true);
		} else {
			setIsVisible(false);
		}
	}, [user.memberGoogleId, user.memberTelegramId, router.isReady, router.pathname]);

	const handleClose = (e: React.MouseEvent) => {
		e.stopPropagation();
		setIsVisible(false);
	};

	const handleClick = () => {
		setIsVisible(false);
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
				<SubtextText>Tap to update</SubtextText>
			</ContentBox>
		</ToastContainer>
	);
};

export default LinkAccountToast;
