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
import { useReactiveVar } from '@apollo/client';
import { socketVar, userVar } from '../../apollo/store';
import { Logout } from '@mui/icons-material';
import { REACT_APP_API_URL } from '../config';
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

const Top = () => {
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const socket = useReactiveVar(socketVar);
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

		// Solid white navbar only on these pages
		const isSolidPage =
			router.pathname === '/mypage' ||
			router.pathname === '/member' ||
			router.pathname === '/agent/detail';

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
	}, [router.pathname]);

	useEffect(() => {
		const jwt = getJwtToken();
		if (jwt) updateUserInfo(jwt);
	}, []);

	useEffect(() => {
		if (socket && user?._id) {
			socket.onmessage = (msg) => {
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

			socket.onerror = (error) => {
				console.error('WebSocket error:', error);
			};
		}

		return () => {
			if (socket) {
				socket.onmessage = null;
				socket.onerror = null;
			}
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
							{user?._id && (
								<IconButton onClick={handleNotificationClick} size="small">
									<Badge color="error" variant="dot" invisible={!hasUnreadNotifications}>
										<NotificationsOutlinedIcon className={'notification-icon'} />
									</Badge>
								</IconButton>
							)}

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
									<img
										className={'mobile-user-avatar'}
										src={
											user?.memberImage
												? user.memberImage.startsWith('http')
													? user.memberImage
													: `${REACT_APP_API_URL}/${user.memberImage}`
												: '/img/profile/defaultUser.svg'
										}
										alt=""
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
							<Link href={'/'}>
								<div>{t('Home')}</div>
							</Link>
							<Link href={'/property'}>
								<div>{t('Properties')}</div>
							</Link>
							<Link href={'/agent'}>
								<div>{t('Agents')}</div>
							</Link>

							<Link href={'/repairService'}>
								<div>{t('Service')}</div>
							</Link>

							<Link href="/" className={`logo-box ${isTransparent ? 'transparent' : ''}`}>
								<img src="/img/logo/12.png" alt="Logo 11" className="logo11" />
								<img src="/img/logo/11.png" alt="Logo 12" className="logo111" />
							</Link>

							<Link href={'/community?articleCategory=FREE'}>
								<div>{t('Community')}</div>
							</Link>

							{user?._id && (
								<Link href={'/mypage'}>
									<div>{t('My Page')}</div>
								</Link>
							)}

							<Link href={'/cs'}>
								<div>{t('CS')}</div>
							</Link>
						</Box>
						<Box component={'div'} className={'user-box'}>
							{user?._id ? (
								<>
									<div className={'login-user'} onClick={(event: any) => setLogoutAnchor(event.currentTarget)}>
										<img
											src={
												user?.memberImage
													? user.memberImage.startsWith('http')
														? user.memberImage
														: `${REACT_APP_API_URL}/${user.memberImage}`
													: '/img/profile/defaultUser.svg'
											}
											alt=""
										/>
									</div>

									<Menu
										id="basic-menu"
										anchorEl={logoutAnchor}
										open={logoutOpen}
										onClose={() => {
											setLogoutAnchor(null);
										}}
										sx={{ mt: '5px' }}
									>
										<MenuItem onClick={() => logOut()}>
											<Logout fontSize="small" style={{ color: 'blue', marginRight: '10px' }} />
											{t('Logout')}
										</MenuItem>
									</Menu>
								</>
							) : (
								<Link href={'/account/join'}>
									<div className={'join-box'}>
										<AccountCircleOutlinedIcon />
										<span>
											{t('Login')} / {t('Register')}
										</span>
									</div>
								</Link>
							)}

							<div className={'lan-box'}>
								{user?._id && (
									<>
										<IconButton onClick={handleNotificationClick} size="small" sx={{ mr: 2 }}>
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
									className="btn-lang"
									onClick={langClick}
									endIcon={<CaretDown size={14} color="#616161" weight="fill" />}
								>
									<Box component={'div'} className={'flag'}>
										{lang !== null ? (
											<img src={`/img/flag/lang${lang}.png`} alt={'flagIcon'} />
										) : (
											<img src={`/img/flag/langen.png`} alt={'flagIcon'} />
										)}
									</Box>
								</Button>
								<StyledMenu anchorEl={anchorEl2} open={drop} onClose={langClose} sx={{ position: 'absolute' }}>
									<MenuItem disableRipple onClick={langChoice} id="en">
										<img
											className="img-flag"
											src={'/img/flag/langen.png'}
											onClick={langChoice}
											id="en"
											alt={'englishFlag'}
										/>
										{t('English')}
									</MenuItem>
									<MenuItem disableRipple onClick={langChoice} id="kr">
										<img
											className="img-flag"
											src={'/img/flag/langkr.png'}
											onClick={langChoice}
											id="kr"
											alt={'koreanFlag'}
										/>
										{t('Korean')}
									</MenuItem>
									<MenuItem disableRipple onClick={langChoice} id="ru">
										<img
											className="img-flag"
											src={'/img/flag/langru.png'}
											onClick={langChoice}
											id="ru"
											alt={'russianFlag'}
										/>
										{t('Russian')}
									</MenuItem>
									<MenuItem disableRipple onClick={langChoice} id="ar">
										<img
											className="img-flag"
											src={'/img/flag/langar.png'}
											onClick={langChoice}
											id="ar"
											alt={'arabicFlag'}
										/>
										{t('Arabic')}
									</MenuItem>
									<MenuItem disableRipple onClick={langChoice} id="uz">
										<img
											className="img-flag"
											src={'/img/flag/languz.png'}
											onClick={langChoice}
											id="uz"
											alt={'uzbekFlag'}
										/>
										{t('Uzbek')}
									</MenuItem>
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
