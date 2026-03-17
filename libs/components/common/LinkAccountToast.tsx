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
	bottom: '24px',
	right: '24px',
	width: '320px',
	backgroundColor: 'rgba(0, 0, 0, 0.9)',
	backdropFilter: 'blur(10px)',
	borderRadius: '16px',
	padding: '20px',
	display: 'flex',
	alignItems: 'center',
	gap: '12px',
	zIndex: 9999,
	boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
	border: '1px solid rgba(255, 255, 255, 0.1)',
	cursor: 'pointer',
	'&.toast-enter': {
		animation: `${slideIn} 0.8s ease-out forwards`,
	},
	'&.toast-exit': {
		animation: `${slideOut} 0.8s ease-out forwards`,
	},
	'&:hover': {
		backgroundColor: 'rgba(0, 0, 0, 0.95)',
	},
	[theme.breakpoints.down('sm')]: {
		width: '280px',
		right: '12px',
		bottom: '12px',
		padding: '16px',
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
	},
});

const ContentBox = styled(Box)({
	flex: 1,
	display: 'flex',
	flexDirection: 'column',
	gap: '4px',
});

const MessageText = styled(Typography)({
	fontSize: '14px',
	fontWeight: 500,
	lineHeight: 1.3,
});

const SubtextText = styled(Typography)({
	fontSize: '12px',
	opacity: 0.7,
	fontWeight: 400,
});

const CloseButton = styled(Box)({
	position: 'absolute',
	top: '8px',
	right: '8px',
	width: '20px',
	height: '20px',
	borderRadius: '50%',
	backgroundColor: 'rgba(255, 255, 255, 0.2)',
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	cursor: 'pointer',
	fontSize: '12px',
	color: '#ffffff',
	'&:hover': {
		backgroundColor: 'rgba(255, 255, 255, 0.3)',
	},
});

const LinkAccountToast = () => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [isVisible, setIsVisible] = useState(false);
	const [animationClass, setAnimationClass] = useState('');
	const [toastConfig, setToastConfig] = useState<{
		message: string;
		color: string;
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
				color: '#229ED9',
				icon: 'https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg',
			});
			showToast();
		} else if (hasTelegramId && !hasGoogleId) {
			setToastConfig({
				message: 'Connect your Google account',
				color: '#FFFFFF',
				icon: 'https://developers.google.com/identity/images/g-logo.png',
			});
			showToast();
		} else {
			setIsVisible(false);
		}
	}, [user.memberGoogleId, user.memberTelegramId, router.isReady, router.pathname]);

	const showToast = () => {
		setAnimationClass('toast-enter');
		setIsVisible(true);

		setTimeout(() => {
			setAnimationClass('toast-exit');
			setTimeout(() => {
				setIsVisible(false);
			}, 800);
		}, 5000);
	};

	const handleClose = () => {
		setAnimationClass('toast-exit');
		setTimeout(() => {
			setIsVisible(false);
		}, 800);
	};

	const handleClick = () => {
		router.push('/mypage?category=myProfile');
	};

	if (!isVisible || !toastConfig) return null;

	return (
		<ToastContainer className={animationClass} onClick={handleClick}>
			<CloseButton onClick={(e) => {
				e.stopPropagation();
				handleClose();
			}}>
				×
			</CloseButton>

			<IconBox>
				<img src={toastConfig.icon} alt="Account icon" />
			</IconBox>

			<ContentBox>
				<MessageText style={{ color: toastConfig.color }}>
					{toastConfig.message}
				</MessageText>
				<SubtextText style={{ color: toastConfig.color }}>
					Click to update profile
				</SubtextText>
			</ContentBox>
		</ToastContainer>
	);
};

export default LinkAccountToast;
