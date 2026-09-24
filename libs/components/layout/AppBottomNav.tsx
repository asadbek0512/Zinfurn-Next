import React from 'react';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import { useTranslation } from 'next-i18next';
import HomeIcon from '@mui/icons-material/Home';
import WeekendOutlinedIcon from '@mui/icons-material/WeekendOutlined';
import WeekendIcon from '@mui/icons-material/Weekend';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import PeopleIcon from '@mui/icons-material/People';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import BuildIcon from '@mui/icons-material/Build';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import PersonIcon from '@mui/icons-material/Person';
import { userVar } from '../../../apollo/store';
import useAppMode from '../../hooks/useAppMode';

type NavTab = {
	key: string;
	label: string;
	icon: React.ReactNode;
	activeIcon: React.ReactNode;
	href?: string;
	/** Markazdagi kattalashtirilgan tab (Bosh sahifa) */
	center?: boolean;
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

	if (!appMode) return null;

	const path = router.pathname;
	const profileHref = user?._id ? '/mypage' : '/account/join';

	const tabs: NavTab[] = [
		{ key: 'products', label: t('Properties'), href: '/products', icon: <WeekendOutlinedIcon />, activeIcon: <WeekendIcon /> },
		{ key: 'agents', label: t('Agents'), href: '/agent', icon: <PeopleOutlinedIcon />, activeIcon: <PeopleIcon /> },
		{ key: 'home', label: t('Home'), href: '/', icon: <HomeIcon />, activeIcon: <HomeIcon />, center: true },
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
						className={`app-nav-item${tab.center ? ' center' : ''}${active ? ' active' : ''}`}
						aria-current={active ? 'page' : undefined}
						aria-label={tab.label}
						onClick={() => handleTab(tab)}
					>
						<span className={'app-nav-icon'}>{active ? tab.activeIcon : tab.icon}</span>
						<span className={'app-nav-label'}>{tab.label}</span>
					</button>
				);
			})}
		</nav>
	);
};

export default AppBottomNav;
