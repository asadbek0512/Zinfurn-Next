import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { useRouter } from 'next/router';

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
	top: '100px',
	right: '24px',
	width: '280px',
	backgroundColor: 'rgba(0, 0, 0, 0.5)',
	backdropFilter: 'blur(10px)',
	borderRadius: '12px',
	padding: '16px',
	display: 'flex',
	alignItems: 'center',
	gap: '12px',
	zIndex: 9999,
	boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
	border: '1px solid rgba(255, 255, 255, 0.1)',
	cursor: 'pointer',
	'&.toast-enter': {
		animation: `${slideIn} 0.6s ease-out forwards`,
	},
	'&.toast-exit': {
		animation: `${slideOut} 0.6s ease-out forwards`,
	},
	'&:hover': {
		backgroundColor: 'rgba(0, 0, 0, 0.6)',
	},
	[theme.breakpoints.down('sm')]: {
		width: '240px',
		right: '12px',
		top: '90px',
		padding: '14px',
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
	backgroundColor: 'rgba(255, 255, 255, 0.1)',
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
	color: '#FFFFFF',
});

const SubtextText = styled(Typography)({
	fontSize: '11px',
	color: 'rgba(255, 255, 255, 0.6)',
	fontWeight: 400,
});

const CloseButton = styled(Box)({
	position: 'absolute',
	top: '4px',
	right: '4px',
	width: '18px',
	height: '18px',
	borderRadius: '50%',
	backgroundColor: 'rgba(255, 255, 255, 0.1)',
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	cursor: 'pointer',
	fontSize: '12px',
	color: '#FFFFFF',
	'&:hover': {
		backgroundColor: 'rgba(255, 255, 255, 0.2)',
	},
});

const LinkAccountToast = () => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [isVisible, setIsVisible] = useState(false);
	const [animationClass, setAnimationClass] = useState('');
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
				message: 'Connect Telegram',
				subtext: 'Link for security',
				icon: 'https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg',
			});
			showToast();
		} else if (hasTelegramId && !hasGoogleId) {
			setToastConfig({
				message: 'Connect Google',
				subtext: 'Link for security',
				icon: 'https://developers.google.com/identity/images/g-logo.png',
			});
			showToast();
		} else {
			setIsVisible(false);
		}
	}, [user._id, user.memberGoogleId, user.memberTelegramId, router.isReady, router.pathname]);

	const showToast = () => {
		setAnimationClass('toast-enter');
		setIsVisible(true);
	};

	const handleClose = (e: React.MouseEvent) => {
		e.stopPropagation();
		setAnimationClass('toast-exit');
		setTimeout(() => {
			setIsVisible(false);
		}, 600);
	};

	const handleClick = () => {
		setAnimationClass('toast-exit');
		setTimeout(() => {
			setIsVisible(false);
			// Direct link to Google or Telegram
			if (toastConfig.message === 'Connect Google') {
				window.location.href = `${process.env.REACT_APP_API_URL}/auth/link/google?state=${user._id}`;
			} else if (toastConfig.message === 'Connect Telegram') {
				// For Telegram, redirect to mypage where user can initiate Telegram link
				router.push('/mypage?category=myProfile&linkTelegram=true');
			}
		}, 600);
	};

	if (!isVisible || !toastConfig) return null;

	return (
		<ToastContainer className={animationClass} onClick={handleClick}>
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
