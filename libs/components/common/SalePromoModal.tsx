import React, { useEffect, useRef, useState } from 'react';
import { useQuery, useReactiveVar } from '@apollo/client';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useCurrency } from '../../context/CurrencyContext';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import { GET_PROPERTIES } from '../../../apollo/user/query';
import { userVar } from '../../../apollo/store';
import { REACT_APP_API_URL } from '../../config';
import { Property } from '../../types/property/property';
import { T } from '../../types/common';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { isSaleActive } from '../../utils/sale';


const DISMISS_KEY_PREFIX = 'zin_sale_promo';
const LAST_SHOWN_KEY = 'zin_last_sale_id';
const SESSION_SHOWN_KEY = 'zin_promo_session_shown';
const SESSION_USER_KEY = 'zin_promo_session_user';

const SalePromoModal = () => {
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const router = useRouter();
	const { t } = useTranslation('common');
	const { formatPrice } = useCurrency();
	const [visible, setVisible] = useState(false);
	const [dontShow, setDontShow] = useState(false);
	const [currentProp, setCurrentProp] = useState<Property | null>(null);
	const [timeLeft, setTimeLeft] = useState<{ h: number; m: number; s: number } | null>(null);
	const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

	const getDismissKey = () => {
		const today = new Date().toDateString();
		return `${DISMISS_KEY_PREFIX}_${user!._id}_${today}`;
	};

	const pickProduct = (list: Property[]) => {
		if (list.length === 0) return null;
		const lastId = typeof window !== 'undefined' ? localStorage.getItem(LAST_SHOWN_KEY) : null;
		const pool = list.filter((p) => p._id !== lastId);
		const chosen = (pool.length > 0 ? pool : list)[Math.floor(Math.random() * (pool.length > 0 ? pool.length : list.length))];
		if (typeof window !== 'undefined') localStorage.setItem(LAST_SHOWN_KEY, chosen._id);
		return chosen;
	};

	useQuery(GET_PROPERTIES, {
		fetchPolicy: 'cache-and-network',
		variables: {
			input: { page: 1, limit: 16, sort: 'createdAt', direction: 'DESC', search: {} },
		},
		onCompleted: (data: T) => {
			const onSale: Property[] = (data?.getProperties?.list ?? []).filter((p: Property) => isSaleActive(p));
			if (onSale.length === 0) return;
			setCurrentProp(pickProduct(onSale));
		},
	});

	// Login yoki logout bo'lganda session flagni tozalash
	useEffect(() => {
		if (typeof window === 'undefined') return;
		const storedId = sessionStorage.getItem(SESSION_USER_KEY) ?? '';
		const currentId = user?._id ?? '';
		if (storedId !== currentId) {
			sessionStorage.removeItem(SESSION_SHOWN_KEY);
			sessionStorage.setItem(SESSION_USER_KEY, currentId);
		}
	}, [user?._id]);

	// Modal ko'rsatish — har yangi kirish, login yoki logout bo'lganda
	useEffect(() => {
		if (typeof window === 'undefined' || !currentProp) return;
		if (sessionStorage.getItem(SESSION_SHOWN_KEY)) return;
		if (user?._id && localStorage.getItem(getDismissKey())) return;
		const timer = setTimeout(() => {
			setVisible(true);
			sessionStorage.setItem(SESSION_SHOWN_KEY, '1');
		}, 1800);
		return () => clearTimeout(timer);
	}, [currentProp, user?._id]);

	// Countdown timer
	useEffect(() => {
		if (!visible || !currentProp?.propertySaleExpiresAt) return;

		const tick = () => {
			const diff = new Date(currentProp.propertySaleExpiresAt!).getTime() - Date.now();
			if (diff <= 0) {
				setTimeLeft({ h: 0, m: 0, s: 0 });
				if (countdownRef.current) clearInterval(countdownRef.current);
				return;
			}
			setTimeLeft({
				h: Math.floor(diff / 3600000) % 24,
				m: Math.floor((diff % 3600000) / 60000),
				s: Math.floor((diff % 60000) / 1000),
			});
		};

		tick();
		countdownRef.current = setInterval(tick, 1000);
		return () => { if (countdownRef.current) clearInterval(countdownRef.current); };
	}, [visible, currentProp]);

	if (device !== 'mobile') return null;
	if (!visible || !currentProp) return null;

	const prop = currentProp;
	const img = prop.propertyImages?.[0]
		? `${REACT_APP_API_URL}/${prop.propertyImages[0]}`
		: '/img/banner/Home-1-.jpg';
	const discount = prop.propertySalePrice
		? Math.round(((prop.propertyPrice - prop.propertySalePrice) / prop.propertyPrice) * 100)
		: 0;

	const handleClose = () => {
		if (countdownRef.current) clearInterval(countdownRef.current);
		if (dontShow && user?._id && typeof window !== 'undefined') {
			localStorage.setItem(getDismissKey(), '1');
		}
		setVisible(false);
	};

	const goDetail = () => {
		router.push(`/products/detail?id=${prop._id}`);
		handleClose();
	};

	return (
		<div className="spm-overlay" onClick={(e) => e.currentTarget === e.target && handleClose()}>
			<div className="spm-card">
				{/* ── Top bar ── */}
				<div className="spm-topbar">
					<div className="spm-fire-badge">
						<LocalFireDepartmentIcon className="spm-fire-icon" />
						<span>FLASH SALE</span>
					</div>
					<button className="spm-close-btn" onClick={handleClose} aria-label="close">
						<CloseIcon style={{ fontSize: 20 }} />
					</button>
				</div>

				{/* ── Image ── */}
				<div className="spm-img-wrap" onClick={goDetail}>
					<img src={img} alt={prop.propertyTitle} className="spm-img" loading="lazy" decoding="async" />
					{discount > 0 && <div className="spm-discount-badge">-{discount}%</div>}
				</div>

				{/* ── Info ── */}
				<div className="spm-info" onClick={goDetail}>
					<p className="spm-title">{prop.propertyTitle}</p>
					<div className="spm-price-row">
						<span className="spm-sale-price">{formatPrice(prop.propertySalePrice)}</span>
						<span className="spm-orig-price">{formatPrice(prop.propertyPrice)}</span>
						{discount > 0 && <span className="spm-save-txt">Save {discount}%</span>}
					</div>

					{timeLeft && (
						<div className="spm-countdown">
							<span className="spm-countdown-label">{t('Sale ends in')}:</span>
							<span className="spm-countdown-chip">{timeLeft.h}hr</span>
							<span className="spm-countdown-sep">:</span>
							<span className="spm-countdown-chip">{String(timeLeft.m).padStart(2, '0')}min</span>
							<span className="spm-countdown-sep">:</span>
							<span className="spm-countdown-chip">{String(timeLeft.s).padStart(2, '0')}sec</span>
						</div>
					)}
				</div>

				{/* ── Footer ── */}
				<div className="spm-footer">
					<label className="spm-checkbox-label" onClick={() => setDontShow((p) => !p)}>
						<div className={`spm-checkbox ${dontShow ? 'spm-checkbox--checked' : ''}`}>
							{dontShow && <CheckIcon className="spm-check-icon" />}
						</div>
						<span>{t('Dont show today')}</span>
					</label>
					<button className="spm-hide-btn" onClick={handleClose}>
						{t('Hide')}
					</button>
				</div>
			</div>
		</div>
	);
};

export default SalePromoModal;
