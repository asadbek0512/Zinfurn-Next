import React from 'react';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import { useTranslation } from 'next-i18next';
import { Badge } from '@mui/material';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import HomeIcon from '@mui/icons-material/Home';
import WeekendOutlinedIcon from '@mui/icons-material/WeekendOutlined';
import WeekendIcon from '@mui/icons-material/Weekend';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import BuildIcon from '@mui/icons-material/Build';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import PersonIcon from '@mui/icons-material/Person';
import { cartVar, cartDrawerVar, userVar } from '../../../apollo/store';
import { getCartCount } from '../../utils/cartUtils';
import useAppMode from '../../hooks/useAppMode';

const CART_BADGE_MAX = 99;

type NavTab = {
	key: string;
	label: string;
	icon: React.ReactNode;
	activeIcon: React.ReactNode;
	href?: string;
	onClick?: () => void;
	badge?: number;
};

/**
 * App (Capacitor) ichida pastda turadigan native uslubdagi navbar.
 * Web brauzerda render qilinmaydi — yon menyu o'sha yerda qoladi.
 */
const AppBottomNav = () => {
	const appMode = useAppMode();
	const router = useRouter();
	const { t } = useTranslation('common');
	const user = useReactiveVar(userVar);
	const cartCount = getCartCount(useReactiveVar(cartVar));

	if (!appMode) return null;

	const path = router.pathname;
	const profileHref = user?._id ? '/mypage' : '/account/join';

	const tabs: NavTab[] = [
		{ key: 'home', label: t('Home'), href: '/', icon: <HomeOutlinedIcon />, activeIcon: <HomeIcon /> },
		{ key: 'products', label: t('Properties'), href: '/products', icon: <WeekendOutlinedIcon />, activeIcon: <WeekendIcon /> },
		{
			key: 'cart',
			label: t('Cart'),
			onClick: () => cartDrawerVar(true),
			icon: <ShoppingCartOutlinedIcon />,
			activeIcon: <ShoppingCartIcon />,
			badge: cartCount,
		},
		{ key: 'service', label: t('Service'), href: '/repairService', icon: <BuildOutlinedIcon />, activeIcon: <BuildIcon /> },
		{ key: 'profile', label: t('Profile'), href: profileHref, icon: <PersonOutlinedIcon />, activeIcon: <PersonIcon /> },
	];

	const isActive = (tab: NavTab): boolean => {
		if (!tab.href) return false;
		if (tab.href === '/') return path === '/';
		if (tab.key === 'profile') return path.startsWith('/mypage') || path.startsWith('/account');
		return path.startsWith(tab.href);
	};

	const handleTab = (tab: NavTab) => {
		if (tab.onClick) {
			tab.onClick();
			return;
		}
		if (tab.href && !isActive(tab)) router.push(tab.href);
	};

	return (
		<nav className={'app-bottom-nav'} role="navigation" aria-label="App navigation">
			{tabs.map((tab) => {
				const active = isActive(tab);
				return (
					<button
						key={tab.key}
						type="button"
						className={active ? 'app-nav-item active' : 'app-nav-item'}
						aria-current={active ? 'page' : undefined}
						aria-label={tab.label}
						onClick={() => handleTab(tab)}
					>
						<span className={'app-nav-icon'}>
							{tab.badge ? (
								<Badge badgeContent={tab.badge} max={CART_BADGE_MAX} color="error" overlap="circular">
									{active ? tab.activeIcon : tab.icon}
								</Badge>
							) : active ? (
								tab.activeIcon
							) : (
								tab.icon
							)}
						</span>
						<span className={'app-nav-label'}>{tab.label}</span>
					</button>
				);
			})}
		</nav>
	);
};

export default AppBottomNav;
