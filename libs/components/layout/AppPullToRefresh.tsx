import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { useApolloClient } from '@apollo/client';
import { CircularProgress } from '@mui/material';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import useAppMode from '../../hooks/useAppMode';
import { hapticTap } from '../../native';

// Pastga tortish: RESISTANCE barmoq harakatini sekinlashtiradi, THRESHOLD'dan o'tsa yangilanadi
const PULL_RESISTANCE = 0.5;
const PULL_THRESHOLD = 70;
const PULL_MAX = 110;

const isModalOpen = (): boolean => !!document.querySelector('.MuiModal-root, .spm-overlay');

const AppPullToRefresh = () => {
	const appMode = useAppMode();
	const router = useRouter();
	const client = useApolloClient();
	const [pull, setPull] = useState(0);
	const [refreshing, setRefreshing] = useState(false);
	const startY = useRef<number | null>(null);
	const pullRef = useRef(0);
	const refreshingRef = useRef(false);

	useEffect(() => {
		if (!appMode) return;

		const updatePull = (value: number) => {
			pullRef.current = value;
			setPull(value);
		};

		const onTouchStart = (e: TouchEvent) => {
			if (refreshingRef.current || window.scrollY > 0 || isModalOpen()) return;
			startY.current = e.touches[0].clientY;
		};

		const onTouchMove = (e: TouchEvent) => {
			if (startY.current === null) return;
			const dy = e.touches[0].clientY - startY.current;
			if (dy <= 0 || window.scrollY > 0) {
				updatePull(0);
				return;
			}
			updatePull(Math.min(dy * PULL_RESISTANCE, PULL_MAX));
		};

		const onTouchEnd = async () => {
			if (startY.current === null) return;
			startY.current = null;
			if (pullRef.current < PULL_THRESHOLD) {
				updatePull(0);
				return;
			}
			refreshingRef.current = true;
			setRefreshing(true);
			hapticTap();
			try {
				await Promise.all([
					client.refetchQueries({ include: 'active' }),
					router.replace(router.asPath, undefined, { scroll: false }),
				]);
			} finally {
				refreshingRef.current = false;
				setRefreshing(false);
				updatePull(0);
			}
		};

		window.addEventListener('touchstart', onTouchStart, { passive: true });
		window.addEventListener('touchmove', onTouchMove, { passive: true });
		window.addEventListener('touchend', onTouchEnd);
		window.addEventListener('touchcancel', onTouchEnd);
		return () => {
			window.removeEventListener('touchstart', onTouchStart);
			window.removeEventListener('touchmove', onTouchMove);
			window.removeEventListener('touchend', onTouchEnd);
			window.removeEventListener('touchcancel', onTouchEnd);
		};
	}, [appMode, client, router]);

	if (!appMode || (pull === 0 && !refreshing)) return null;

	const offset = refreshing ? PULL_THRESHOLD : pull;
	const ready = pull >= PULL_THRESHOLD;

	return (
		<div className="app-ptr" style={{ transform: `translate(-50%, ${offset}px)`, opacity: Math.min(offset / PULL_THRESHOLD, 1) }}>
			{refreshing ? (
				<CircularProgress size={20} thickness={5} />
			) : (
				<ArrowDownwardIcon className={`app-ptr-arrow ${ready ? 'ready' : ''}`} />
			)}
		</div>
	);
};

export default AppPullToRefresh;
