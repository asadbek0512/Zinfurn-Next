import React, { useCallback, useEffect, useState } from 'react';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import useDeviceDetect from '../hooks/useDeviceDetect';

const SHOW_AFTER_PX = 400;
const PC_BOTTOM_PX = 88;
const PC_RIGHT_PX = 30;
const MOBILE_BOTTOM_PX = 16;
const MOBILE_RIGHT_PX = 16;
const BUTTON_SIZE_PX = 50;

const ScrollTop = () => {
	const device = useDeviceDetect();
	const [visible, setVisible] = useState<boolean>(false);

	useEffect(() => {
		const onScroll = () => setVisible(window.scrollY > SHOW_AFTER_PX);
		onScroll();
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	}, []);

	const scrollToTop = useCallback(() => {
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}, []);

	const isMobile = device === 'mobile';

	return (
		<button
			type="button"
			aria-label="Scroll to top"
			onClick={scrollToTop}
			style={{
				position: 'fixed',
				bottom: `${isMobile ? MOBILE_BOTTOM_PX : PC_BOTTOM_PX}px`,
				right: `${isMobile ? MOBILE_RIGHT_PX : PC_RIGHT_PX}px`,
				width: `${BUTTON_SIZE_PX}px`,
				height: `${BUTTON_SIZE_PX}px`,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				border: 'none',
				borderRadius: '50%',
				background: 'var(--primary)',
				color: '#fff',
				cursor: 'pointer',
				boxShadow: '0 4px 14px rgba(0, 0, 0, 0.2)',
				zIndex: 1300,
				opacity: visible ? 1 : 0,
				visibility: visible ? 'visible' : 'hidden',
				transform: visible ? 'translateY(0)' : 'translateY(12px)',
				transition: 'opacity 0.3s ease, transform 0.3s ease, visibility 0.3s',
			}}
		>
			<KeyboardArrowUpIcon style={{ fontSize: '28px' }} />
		</button>
	);
};

export default ScrollTop;
