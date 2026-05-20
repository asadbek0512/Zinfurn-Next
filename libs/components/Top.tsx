import React, { useCallback, useEffect, useRef } from 'react';
import { useState } from 'react';
import { useRouter, withRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { getJwtToken, logOut, updateUserInfo } from '../auth';
import { Stack, Box, IconButton, Badge, Drawer } from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import { alpha, styled } from '@mui/material/styles';
import Menu, { MenuProps } from '@mui/material/Menu';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import { CaretDown } from 'phosphor-react';
import useDeviceDetect from '../hooks/useDeviceDetect';
import Link from 'next/link';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import { useReactiveVar } from '@apollo/client';
import { socketVar, userVar, cartVar, cartDrawerVar } from '../../apollo/store';
import { Logout } from '@mui/icons-material';
import { REACT_APP_API_URL } from '../config';
import UserAvatar from './common/UserAvatar';
import NotificationModal from './common/NotificationModal';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import WeekendOutlinedIcon from '@mui/icons-material/WeekendOutlined';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import { getCartCount } from '../utils/cartUtils';
import { useCurrency, Currency } from '../context/CurrencyContext';

const Top = () => {
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const socket = useReactiveVar(socketVar);
	const cartItems = useReactiveVar(cartVar);
	const cartCount = getCartCount(cartItems);
	const { t, i18n } = useTranslation('common');
	const router = useRouter();
	const [anchorEl2, setAnchorEl2] = useState<null | HTMLElement>(null);
	const [lang, setLang] = useState<string | null>('en');
	const drop = Boolean(anchorEl2);
	const [colorChange, setColorChange] = useState(false);
	const [anchorEl, setAnchorEl] = React.useState<any | HTMLElement>(null);
	let open = Boolean(anchorEl);
	const [bgColor, setBgColor] = useState<boolean>(false);
	const [logoutAnchor, setLogoutAnchor] = React.useState<null | HTMLElement>(null);
	const logoutOpen = Boolean(logoutAnchor);
	const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
	const [notificationAnchor, setNotificationAnchor] = React.useState<null | HTMLElement>(null);
	const notificationOpen = Boolean(notificationAnchor);
	const [isTransparent, setIsTransparent] = useState(false);
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const { currency, setCurrency } = useCurrency();
	const [currencyAnchor, setCurrencyAnchor] = React.useState<null | HTMLElement>(null);
	const currencyOpen = Boolean(currencyAnchor);

	const CURRENCY_LABELS: Record<Currency, string> = { USD: '$', KRW: '₩', UZS: "so'm" };

	const handleCurrencyClick = (e: React.MouseEvent<HTMLElement>) => setCurrencyAnchor(e.currentTarget);
	const handleCurrencyClose = () => setCurrencyAnchor(null);
	const handleCurrencySelect = (c: Currency) => { setCurrency(c); handleCurrencyClose(); };

	/** LIFECYCLES **/
	useEffect(() => {
		if (localStorage.getItem('locale') === null) {
			localStorage.setItem('locale', 'en');
			setLang('en');
		} else {
			setLang(localStorage.getItem('locale'));
		}
	}, [router]);

	useEffect(() => {
		const isJoinPage = router.pathname === '/account/join';
		const isDetailPage =
			router.pathname === '/property/detail' ||
			router.pathname === '/repairService/detail';

		// Solid white navbar only on these pages for mobile
		const isSolidPage =
			device === 'mobile' && (router.pathname === '/mypage' || router.pathname === '/member' || router.pathname === '/agent/detail');

		const checkInitialState = () => {
			const scrolled = window.scrollY >= 50;
			setColorChange(scrolled || isDetailPage);
			setIsTransparent(!isSolidPage && !isDetailPage && !scrolled);
			setBgColor(isDetailPage || isJoinPage);
		};

		const handleScroll = () => {
			const scrolled = window.scrollY >= 50;
			setColorChange(scrolled || isDetailPage);
			setIsTransparent(!isSolidPage && !isDetailPage && !scrolled);
		};

		checkInitialState();
		window.addEventListener('scroll', handleScroll);

		return () => {
			window.removeEventListener('scroll', handleScroll);
		};
	}, [router.pathname, device]);

	useEffect(() => {
		const jwt = getJwtToken();
		if (jwt) updateUserInfo(jwt);
	}, []);

	useEffect(() => {
		if (!socket || !user?._id) return;

		const handleMessage = (msg: MessageEvent) => {
			try {
				const data = JSON.parse(msg.data);
				if (data.event === 'notification') {
					if (data.payload.status === 'WAIT') {
						setHasUnreadNotifications(true);
					}
				} else if (data.event === 'unreadNotifications') {
					if (data.payload && data.payload.length > 0) {
						setHasUnreadNotifications(true);
					}
				}
			} catch (error) {
				console.error('Error processing message:', error);
			}
		};

		socket.addEventListener('message', handleMessage);

		return () => {
			socket.removeEventListener('message', handleMessage);
		};
	}, [socket, user]);

	/** HANDLERS **/
	const langClick = (e: any) => {
		setAnchorEl2(e.currentTarget);
	};

	const langClose = () => {
		setAnchorEl2(null);
	};

	const langChoice = useCallback(
		async (e: any) => {
			setLang(e.target.id);
			localStorage.setItem('locale', e.target.id);
			setAnchorEl2(null);
			await router.push(router.asPath, router.asPath, { locale: e.target.id });
		},
		[router],
	);

	const handleClose = () => {
		setAnchorEl(null);
	};

	const handleHover = (event: any) => {
		if (anchorEl !== event.currentTarget) {
			setAnchorEl(event.currentTarget);
		} else {
			setAnchorEl(null);
		}
	};

	const handleNotificationClick = (event: React.MouseEvent<HTMLElement>) => {
		setNotificationAnchor(event.currentTarget);
	};

	const handleNotificationClose = () => {
		setNotificationAnchor(null);
	};

	const handleUnreadCountChange = (count: number) => {
		setHasUnreadNotifications(count > 0);
	};

	const StyledMenu = styled((props: MenuProps) => (
		<Menu
			elevation={0}
			anchorOrigin={{
				vertical: 'bottom',
				horizontal: 'right',
			}}
			transformOrigin={{
				vertical: 'top',
				horizontal: 'right',
			}}
			{...props}
		/>
	))(({ theme }) => ({
		'& .MuiPaper-root': {
			top: '109px',
			borderRadius: 6,
			marginTop: theme.spacing(1),
			minWidth: 160,
			color: theme.palette.mode === 'light' ? 'rgb(55, 65, 81)' : theme.palette.grey[300],
			boxShadow:
				'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px',
			'& .MuiMenu-list': {
				padding: '4px 0',
			},
			'& .MuiMenuItem-root': {
				'& .MuiSvgIcon-root': {
					fontSize: 18,
					color: theme.palette.text.secondary,
					marginRight: theme.spacing(1.5),
				},
				'&:active': {
					backgroundColor: alpha(theme.palette.primary.main, theme.palette.action.selectedOpacity),
				},
			},
		},
	}));

	if (device == 'mobile') {
		return (
			<Stack className={'mobile-navbar'}>
				<Stack className={`mobile-navbar-main ${isTransparent ? 'transparent' : ''}`}>
					<Stack className={'mobile-container'} display={'flex'}>
						{/* Logo */}
						<div className={'mobile-logo-box'}>
							<Link href={'/'}>
								<div className={`logo-box ${isTransparent ? 'transparent' : ''}`}>
									<img src="/img/logo/12.png" alt="Logo" className="logo11" />
									<img src="/img/logo/11.png" alt="Logo" className="logo111" />
								</div>
							</Link>
						</div>

						{/* Right icons */}
						<div className={'mobile-user-box'}>
								<IconButton size="small" onClick={() => cartDrawerVar(true)} className="cart-nav-btn">
								<Badge badgeContent={cartCount} max={99} sx={{ '& .MuiBadge-badge': { backgroundColor: '#cf6422', color: '#fff' } }}>
									<ShoppingCartOutlinedIcon className={'notification-icon'} />
								</Badge>
							</IconButton>
							{user?._id && (
								<IconButton onClick={handleNotificationClick} size="small">
									<Badge color="error" variant="dot" invisible={!hasUnreadNotifications}>
										<NotificationsOutlinedIcon className={'notification-icon'} />
									</Badge>
								</IconButton>
							)}

							<Button
								disableRipple
								className="btn-lang btn-currency"
								onClick={handleCurrencyClick}
								endIcon={<CaretDown size={10} color={isTransparent ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.45)'} weight="fill" />}
							>
								<span className="currency-label">{CURRENCY_LABELS[currency]}</span>
							</Button>
							<StyledMenu anchorEl={currencyAnchor} open={currencyOpen} onClose={handleCurrencyClose}>
								{(['USD', 'KRW', 'UZS'] as Currency[]).map((c) => (
									<MenuItem key={c} disableRipple selected={currency === c} onClick={() => handleCurrencySelect(c)}
										sx={{ fontWeight: currency === c ? 700 : 400, color: currency === c ? '#cf6422' : 'inherit' }}>
										<span style={{ marginRight: 8 }}>{CURRENCY_LABELS[c]}</span>{c}
									</MenuItem>
								))}
							</StyledMenu>

							<Button
								disableRipple
								className="btn-lang"
								onClick={langClick}
							>
								<Box component={'div'} className={'flag'}>
									{lang !== null ? (
										<img src={`/img/flag/lang${lang}.png`} alt={'flag'} />
									) : (
										<img src={`/img/flag/langen.png`} alt={'flag'} />
									)}
								</Box>
							</Button>

							{/* Hamburger */}
							<button
								className={'mobile-menu-btn'}
								onClick={() => setMobileMenuOpen(true)}
							>
								<div className={'menu-icon'}>
									<span />
									<span />
									<span />
								</div>
							</button>
						</div>
					</Stack>
				</Stack>

				{/* Language menu */}
				<StyledMenu anchorEl={anchorEl2} open={drop} onClose={langClose} sx={{ position: 'absolute' }}>
					<MenuItem disableRipple onClick={langChoice} id="en">
						<img className="img-flag" src={'/img/flag/langen.png'} onClick={langChoice} id="en" alt={'en'} />
						{t('English')}
					</MenuItem>
					<MenuItem disableRipple onClick={langChoice} id="kr">
						<img className="img-flag" src={'/img/flag/langkr.png'} onClick={langChoice} id="kr" alt={'kr'} />
						{t('Korean')}
					</MenuItem>
					<MenuItem disableRipple onClick={langChoice} id="ru">
						<img className="img-flag" src={'/img/flag/langru.png'} onClick={langChoice} id="ru" alt={'ru'} />
						{t('Russian')}
					</MenuItem>
					<MenuItem disableRipple onClick={langChoice} id="ar">
						<img className="img-flag" src={'/img/flag/langar.png'} onClick={langChoice} id="ar" alt={'ar'} />
						{t('Arabic')}
					</MenuItem>
					<MenuItem disableRipple onClick={langChoice} id="uz">
						<img className="img-flag" src={'/img/flag/languz.png'} onClick={langChoice} id="uz" alt={'uz'} />
						{t('Uzbek')}
					</MenuItem>
				</StyledMenu>

				{/* Notification modal */}
				{user?._id && (
					<NotificationModal
						anchorEl={notificationAnchor}
						open={notificationOpen}
						onClose={handleNotificationClose}
						onUnreadCountChange={handleUnreadCountChange}
					/>
				)}

				{/* Side Drawer */}
				<Drawer
					className={'mobile-side-menu'}
					anchor="right"
					open={mobileMenuOpen}
					onClose={() => setMobileMenuOpen(false)}
				>
					{/* Drawer header */}
					<div className={'mobile-side-header'}>
						{user?._id ? (
							<Link href={'/mypage'} onClick={() => setMobileMenuOpen(false)} style={{ textDecoration: 'none' }}>
								<div className={'mobile-user-info'}>
									<UserAvatar
										className={'mobile-user-avatar'}
										src={
											user?.memberImage
												? user.memberImage.startsWith('http')
													? user.memberImage
													: `${REACT_APP_API_URL}/${user.memberImage}`
												: undefined
										}
										nick={user?.memberNick}
									/>
									<div className={'mobile-user-details'}>
										<span className={'mobile-user-name'}>{user?.memberNick}</span>
										{user?.memberPhone
											? <span className={'mobile-user-phone'}>{user.memberPhone}</span>
											: <span className={'mobile-user-type'}>{t(user?.memberType || 'USER')}</span>
										}
									</div>
									<ChevronRightIcon className={'mobile-user-chevron'} />
								</div>
							</Link>
						) : (
							<Link href={'/account/join'} onClick={() => setMobileMenuOpen(false)} style={{ textDecoration: 'none' }}>
								<div className={'mobile-login-link'}>
									<div className={'mobile-login-avatar'}>
										<AccountCircleOutlinedIcon />
									</div>
									<div className={'mobile-login-text'}>
										<span className={'mobile-login-title'}>{t('Welcome!')}</span>
										<span className={'mobile-login-sub'}>{t('Sign In')} / {t('Create Account')}</span>
									</div>
									<ChevronRightIcon className={'mobile-user-chevron'} />
								</div>
							</Link>
						)}
					</div>

					{/* Nav links */}
					<div className={'mobile-side-items'}>
						{[
							{ href: '/',                               label: t('Home'),       icon: <HomeOutlinedIcon /> },
							{ href: '/property',                       label: t('Properties'), icon: <WeekendOutlinedIcon /> },
							{ href: '/agent',                          label: t('Agents'),     icon: <PeopleOutlinedIcon /> },
							{ href: '/repairService',                  label: t('Service'),    icon: <BuildOutlinedIcon /> },
							{ href: '/community?articleCategory=FREE', label: t('Community'), icon: <ForumOutlinedIcon /> },
							...(user?._id ? [{ href: '/mypage', label: t('My Page'), icon: <PersonOutlinedIcon /> }] : []),
							{ href: '/cs',                             label: t('CS'),         icon: <HelpOutlineIcon /> },
						].map((item) => (
							<Link key={item.href} href={item.href} className={'mobile-side-item'} onClick={() => setMobileMenuOpen(false)}>
								<div className={'mobile-side-item-icon'}>
									{item.icon}
								</div>
								<span className={'mobile-side-item-label'}>{item.label}</span>
								<ChevronRightIcon className={'mobile-side-item-chevron'} />
							</Link>
						))}

						<div className={'mobile-side-divider'} />
						<button
							className={'mobile-side-item mobile-side-btn'}
							onClick={() => {
								window.dispatchEvent(new CustomEvent('toggle-mob-chat'));
								setMobileMenuOpen(false);
							}}
						>
							<div className={'mobile-side-item-icon'}>
								<ChatBubbleOutlineIcon />
							</div>
							<span className={'mobile-side-item-label'}>{t('Live Chat')}</span>
							<ChevronRightIcon className={'mobile-side-item-chevron'} />
						</button>
						<button
							className={'mobile-side-item mobile-side-btn'}
							onClick={() => {
								window.dispatchEvent(new CustomEvent('toggle-mob-ai'));
								setMobileMenuOpen(false);
							}}
						>
							<div className={'mobile-side-item-icon'}>
								<SmartToyOutlinedIcon />
							</div>
							<span className={'mobile-side-item-label'}>{t('AI Assistant')}</span>
							<ChevronRightIcon className={'mobile-side-item-chevron'} />
						</button>

						{/* Logout inside items with separation */}
						{user?._id && (
							<div className={'mobile-side-footer'} style={{ padding: '8px 12px 24px' }}>
								<button
									className={'mobile-logout-btn'}
									onClick={() => { logOut(); setMobileMenuOpen(false); }}
								>
									<Logout fontSize="small" />
									{t('Logout')}
								</button>
							</div>
						)}
					</div>
				</Drawer>
			</Stack>
		);
	} else {
		return (
			<Stack className={'navbar'}>
				<Stack className={`navbar-main ${colorChange ? 'transparent' : ''} ${bgColor ? 'transparent' : ''}`}>
					<Stack className={'container'}>
						<Box
							component={'div'}
							className={`router-box ${i18n.language === 'kr' ? 'korean-margin' : ''} ${
								i18n.language === 'ru' ? 'russian-lang' : ''
							} ${i18n.language === 'ar' ? 'arabic-lang' : ''} ${i18n.language === 'uz' ? 'uzbek-lang' : ''}`}
						>
							<Link href={'/'} prefetch={false}>
								<div>{t('Home')}</div>
							</Link>
							<Link href={'/property'} prefetch={false}>
								<div>{t('Properties')}</div>
							</Link>
							<Link href={'/agent'} prefetch={false}>
								<div>{t('Agents')}</div>
							</Link>

							<Link href={'/repairService'} prefetch={false}>
								<div>{t('Service')}</div>
							</Link>

							<Link href="/" className={`logo-box ${isTransparent ? 'transparent' : ''}`} prefetch={false}>
								<img src="/img/logo/12.png" alt="Logo 11" className="logo11" />
								<img src="/img/logo/11.png" alt="Logo 12" className="logo111" />
							</Link>

							<Link href={'/community?articleCategory=FREE'} prefetch={false}>
								<div>{t('Community')}</div>
							</Link>

							{user?._id && (
								<Link href={'/mypage'} prefetch={false}>
									<div>{t('My Page')}</div>
								</Link>
							)}

							<Link href={'/cs'} prefetch={false}>
								<div>{t('CS')}</div>
							</Link>
						</Box>
						<Box component={'div'} className={'user-box'}>
							{user?._id ? (
								<>
									<div className={'login-user'} onClick={(event: any) => setLogoutAnchor(event.currentTarget)}>
										<UserAvatar
											src={
												user?.memberImage
													? user.memberImage.startsWith('http')
														? user.memberImage
														: `${REACT_APP_API_URL}/${user.memberImage}`
													: undefined
											}
											nick={user?.memberNick}
										/>
									</div>
									<Menu
										anchorEl={logoutAnchor}
										open={logoutOpen}
										onClose={() => setLogoutAnchor(null)}
										sx={{ mt: '5px' }}
									>
										<MenuItem onClick={() => logOut()}>
											<Logout fontSize="small" style={{ color: '#555', marginRight: '10px' }} />
											{t('Logout')}
										</MenuItem>
									</Menu>
								</>
							) : (
								<Link href={'/account/join'} prefetch={false}>
									<div className={'join-box'}>
										<AccountCircleOutlinedIcon />
										<span>{t('Login')} / {t('Register')}</span>
									</div>
								</Link>
							)}

							<div className={'lan-box'}>
								<IconButton onClick={() => cartDrawerVar(true)} size="small" className="cart-nav-btn">
									<Badge badgeContent={cartCount} max={99} sx={{ '& .MuiBadge-badge': { backgroundColor: '#cf6422', color: '#fff', fontSize: '10px', minWidth: '16px', height: '16px' } }}>
										<ShoppingCartOutlinedIcon className={'notification-icon'} sx={{ fontSize: 18 }} />
									</Badge>
								</IconButton>

								{user?._id && (
									<>
										<IconButton onClick={handleNotificationClick} size="small">
											<Badge color="error" variant="dot" invisible={!hasUnreadNotifications}>
												<NotificationsOutlinedIcon className={'notification-icon'} />
											</Badge>
										</IconButton>
										<NotificationModal
											anchorEl={notificationAnchor}
											open={notificationOpen}
											onClose={handleNotificationClose}
											onUnreadCountChange={handleUnreadCountChange}
										/>
									</>
								)}

								<Button
									disableRipple
									className="btn-lang btn-currency"
									onClick={handleCurrencyClick}
									endIcon={<CaretDown size={12} color={(colorChange || bgColor) ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.7)'} weight="fill" />}
								>
									<span className="currency-label">{CURRENCY_LABELS[currency]}</span>
								</Button>
								<StyledMenu anchorEl={currencyAnchor} open={currencyOpen} onClose={handleCurrencyClose}>
									{(['USD', 'KRW', 'UZS'] as Currency[]).map((c) => (
										<MenuItem key={c} disableRipple selected={currency === c} onClick={() => handleCurrencySelect(c)}
											sx={{ fontWeight: currency === c ? 700 : 400, color: currency === c ? '#cf6422' : 'inherit' }}>
											<span style={{ marginRight: 8 }}>{CURRENCY_LABELS[c]}</span>{c}
										</MenuItem>
									))}
								</StyledMenu>

								<Button
									disableRipple
									className="btn-lang"
									onClick={langClick}
									endIcon={<CaretDown size={14} color="#616161" weight="fill" />}
								>
									<Box component={'div'} className={'flag'}>
										<img src={lang ? `/img/flag/lang${lang}.png` : '/img/flag/langen.png'} alt="flag" />
									</Box>
								</Button>
								<StyledMenu anchorEl={anchorEl2} open={drop} onClose={langClose}>
									{[
										{ id: 'en', src: '/img/flag/langen.png', label: t('English') },
										{ id: 'kr', src: '/img/flag/langkr.png', label: t('Korean') },
										{ id: 'ru', src: '/img/flag/langru.png', label: t('Russian') },
										{ id: 'ar', src: '/img/flag/langar.png', label: t('Arabic') },
										{ id: 'uz', src: '/img/flag/languz.png', label: t('Uzbek') },
									].map((l) => (
										<MenuItem key={l.id} disableRipple onClick={langChoice} id={l.id}>
											<img className="img-flag" src={l.src} id={l.id} alt={l.id} />
											{l.label}
										</MenuItem>
									))}
								</StyledMenu>
							</div>
						</Box>
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

export default withRouter(Top);
