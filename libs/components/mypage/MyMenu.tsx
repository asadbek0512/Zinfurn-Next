import React from 'react';
import { useRouter } from 'next/router';
import { Stack, Typography, Box, List, ListItem } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import Link from 'next/link';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import PortraitIcon from '@mui/icons-material/Portrait';
import IconButton from '@mui/material/IconButton';
import { REACT_APP_API_URL } from '../../config';
import { logOut } from '../../auth';
import { sweetConfirmAlert, sweetMixinErrorAlert } from '../../sweetAlert';
import WeekendIcon from '@mui/icons-material/Weekend';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import ArticleIcon from '@mui/icons-material/Article';
import GroupIcon from '@mui/icons-material/Group';
import FavoriteIcon from '@mui/icons-material/Favorite';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import HandymanIcon from '@mui/icons-material/Handyman';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import HistoryIcon from '@mui/icons-material/History';
import EditNoteIcon from '@mui/icons-material/EditNote';
import AddHomeIcon from '@mui/icons-material/AddHome';
import BuildIcon from '@mui/icons-material/Build';
import UserAvatar from '../common/UserAvatar';
import LogoutIcon from '@mui/icons-material/Logout';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import { useTranslation } from 'next-i18next';

const MyMenu = () => {
	const { t } = useTranslation('common');
	const device = useDeviceDetect();
	const router = useRouter();
	const pathname = router.query.category ?? 'myProfile';
	const category: any = router.query?.category ?? 'myProfile';
	const user = useReactiveVar(userVar);

	/** HANDLERS **/
	const logoutHandler = async () => {
		try {
			if (await sweetConfirmAlert(t('Do you want to logout?'))) logOut();
		} catch (err: any) {
			console.log('ERROR, logoutHandler:', err.message);
		}
	};

	if (device === 'mobile') {
		const avatarSrc = user?.memberImage
			? user.memberImage.startsWith('http')
				? user.memberImage
				: `${REACT_APP_API_URL}/${user.memberImage}`
			: '/img/profile/defaultUser.svg';

		const goTo = (cat: string) => router.push({ pathname: '/mypage', query: { category: cat } });

		return (
			<div id="mob-mymenu">
				{/* Profile card */}
				<div className="mob-mymenu-profile-card">
					<div className="mob-mymenu-avatar-wrap">
						<UserAvatar
							src={user?.memberImage && !user.memberImage.includes('defaultUser') ? avatarSrc : undefined}
							nick={user?.memberNick}
							style={{ width: '100%', height: '100%', borderRadius: '50%' }}
						/>
					</div>
					<div className="mob-mymenu-name">{user?.memberNick || t('User')}</div>
					{user?.memberType === 'ADMIN' ? (
						<a href="/_admin/users" className="mob-mymenu-type-badge mob-mymenu-admin-badge">
							{t(user.memberType)}
						</a>
					) : (
						<div className="mob-mymenu-type-badge">{t(user?.memberType || 'USER')}</div>
					)}
				</div>

				{/* Stats bar */}
				<div className="mob-mymenu-stats">
					{(user?.memberType === 'AGENT' || user?.memberType === 'TECHNICIAN') && (
						<div className="mob-mymenu-stat-item">
							<span className="mob-mymenu-stat-num">{user?.memberProperties || 0}</span>
							<span className="mob-mymenu-stat-label">{user?.memberType === 'AGENT' ? t('Items') : t('Repair')}</span>
						</div>
					)}
					<div className="mob-mymenu-stat-item">
						<span className="mob-mymenu-stat-num">{user?.memberArticles || 0}</span>
						<span className="mob-mymenu-stat-label">{t('Articles')}</span>
					</div>
					<div className="mob-mymenu-stat-item">
						<span className="mob-mymenu-stat-num">{user?.memberFollowers || 0}</span>
						<span className="mob-mymenu-stat-label">{t('Followers')}</span>
					</div>
					<div className="mob-mymenu-stat-item">
						<span className="mob-mymenu-stat-num">{user?.memberFollowings || 0}</span>
						<span className="mob-mymenu-stat-label">{t('Following')}</span>
					</div>
					<div className="mob-mymenu-stat-item">
						<span className="mob-mymenu-stat-num">{user?.memberLikes || 0}</span>
						<span className="mob-mymenu-stat-label">{t('Likes')}</span>
					</div>
				</div>

				{/* Account */}
				<div className="mob-mymenu-section">
					<div className="mob-mymenu-section-title">{t('Account')}</div>
					<div className="mob-mymenu-item" onClick={() => goTo('myProfile')}>
						<div className="mob-mymenu-item-icon"><AccountCircleOutlinedIcon /></div>
						<div className="mob-mymenu-item-text">
							<span className="mob-mymenu-item-label">{t('My Profile')}</span>
							{user?.memberPhone && <span className="mob-mymenu-item-sub">{user.memberPhone}</span>}
						</div>
						<ChevronRightIcon className="mob-mymenu-item-chevron" />
					</div>
				</div>

				{/* Manage Listings */}
				<div className="mob-mymenu-section">
					<div className="mob-mymenu-section-title">{t('Manage Listings')}</div>

					{user?.memberType === 'AGENT' && (
						<>
							<div className="mob-mymenu-item" onClick={() => goTo('addProperty')}>
								<div className="mob-mymenu-item-icon"><AddHomeIcon /></div>
								<div className="mob-mymenu-item-text">
									<span className="mob-mymenu-item-label">{t('Add Property')}</span>
								</div>
								<ChevronRightIcon className="mob-mymenu-item-chevron" />
							</div>
							<div className="mob-mymenu-item" onClick={() => goTo('myProperties')}>
								<div className="mob-mymenu-item-icon"><WeekendIcon /></div>
								<div className="mob-mymenu-item-text">
									<span className="mob-mymenu-item-label">{t('My Properties')}</span>
								</div>
								<ChevronRightIcon className="mob-mymenu-item-chevron" />
							</div>
						</>
					)}

					{user?.memberType === 'TECHNICIAN' && (
						<>
							<div className="mob-mymenu-item" onClick={() => goTo('addRepairProperty')}>
								<div className="mob-mymenu-item-icon"><BuildIcon /></div>
								<div className="mob-mymenu-item-text">
									<span className="mob-mymenu-item-label">{t('Add Repair')}</span>
								</div>
								<ChevronRightIcon className="mob-mymenu-item-chevron" />
							</div>
							<div className="mob-mymenu-item" onClick={() => goTo('myRepairProperty')}>
								<div className="mob-mymenu-item-icon"><HandymanIcon /></div>
								<div className="mob-mymenu-item-text">
									<span className="mob-mymenu-item-label">{t('My Repair')}</span>
								</div>
								<ChevronRightIcon className="mob-mymenu-item-chevron" />
							</div>
						</>
					)}

					<div className="mob-mymenu-item" onClick={() => goTo('myFavorites')}>
						<div className="mob-mymenu-item-icon"><FavoriteIcon /></div>
						<div className="mob-mymenu-item-text">
							<span className="mob-mymenu-item-label">{t('My Favorites')}</span>
						</div>
						<ChevronRightIcon className="mob-mymenu-item-chevron" />
					</div>
					<div className="mob-mymenu-item" onClick={() => goTo('recentlyVisited')}>
						<div className="mob-mymenu-item-icon"><HistoryIcon /></div>
						<div className="mob-mymenu-item-text">
							<span className="mob-mymenu-item-label">{t('Recently Visited')}</span>
						</div>
						<ChevronRightIcon className="mob-mymenu-item-chevron" />
					</div>
					<div className="mob-mymenu-item" onClick={() => goTo('myOrders')}>
						<div className="mob-mymenu-item-icon"><ShoppingBagOutlinedIcon /></div>
						<div className="mob-mymenu-item-text">
							<span className="mob-mymenu-item-label">{t('My Orders')}</span>
						</div>
						<ChevronRightIcon className="mob-mymenu-item-chevron" />
					</div>
					<div className="mob-mymenu-item" onClick={() => goTo('followers')}>
						<div className="mob-mymenu-item-icon"><GroupIcon /></div>
						<div className="mob-mymenu-item-text">
							<span className="mob-mymenu-item-label">{t('My Followers')}</span>
						</div>
						<ChevronRightIcon className="mob-mymenu-item-chevron" />
					</div>
					<div className="mob-mymenu-item" onClick={() => goTo('followings')}>
						<div className="mob-mymenu-item-icon"><PersonAddIcon /></div>
						<div className="mob-mymenu-item-text">
							<span className="mob-mymenu-item-label">{t('My Followings')}</span>
						</div>
						<ChevronRightIcon className="mob-mymenu-item-chevron" />
					</div>
				</div>

				{/* Community */}
				<div className="mob-mymenu-section">
					<div className="mob-mymenu-section-title">{t('Community')}</div>
					<div className="mob-mymenu-item" onClick={() => goTo('myArticles')}>
						<div className="mob-mymenu-item-icon"><ArticleIcon /></div>
						<div className="mob-mymenu-item-text">
							<span className="mob-mymenu-item-label">{t('Articles')}</span>
						</div>
						<ChevronRightIcon className="mob-mymenu-item-chevron" />
					</div>
					<div className="mob-mymenu-item" onClick={() => goTo('writeArticle')}>
						<div className="mob-mymenu-item-icon"><EditNoteIcon /></div>
						<div className="mob-mymenu-item-text">
							<span className="mob-mymenu-item-label">{t('Write Article')}</span>
						</div>
						<ChevronRightIcon className="mob-mymenu-item-chevron" />
					</div>
				</div>

				{/* Logout */}
				<div className="mob-mymenu-section">
					<div className="mob-mymenu-item logout" onClick={logoutHandler}>
						<div className="mob-mymenu-item-icon logout-icon"><LogoutIcon /></div>
						<div className="mob-mymenu-item-text">
							<span className="mob-mymenu-item-label">{t('Logout')}</span>
						</div>
					</div>
				</div>
			</div>
		);
	} else {
		return (
			<Stack width={'100%'} padding={'30px 24px'}>
				<Stack className={'profile'}>
					<Box component={'div'} className={'profile-img'}>
						<UserAvatar
							src={
								user?.memberImage && !user.memberImage.includes('defaultUser')
									? user.memberImage.startsWith('http')
										? user.memberImage
										: `${REACT_APP_API_URL}/${user.memberImage}`
									: undefined
							}
							nick={user?.memberNick}
							style={{ width: 90, height: 90 }}
						/>
					</Box>

					<Stack className={'user-info'}>
						<Typography className={'user-name'}>{user?.memberNick}</Typography>
						<Box component={'div'} className={'user-phone'}>
							<img src={'/img/icons/call.svg'} alt={'icon'} />
							<Typography className={'p-number'}>{user?.memberPhone}</Typography>
						</Box>
						{user?.memberType === 'ADMIN' ? (
							<a href="/_admin/users" target={'_blank'}>
								<Typography className={'view-list'}>{t(user?.memberType)}</Typography>
							</a>
						) : (
							<Typography className={'view-list'}>{t(user?.memberType)}</Typography>
						)}
					</Stack>

					<Box component="div" className={'user-stats'}>
						{user?.memberType === 'AGENT' && (
							<Box component="div" className={'stat-item'}>
								<WeekendIcon className="stat-icon" />
								<Typography className={'stat-number'}>{user?.memberProperties}</Typography>
								<Typography className={'stat-label'}>{t('Furniture')}</Typography>
							</Box>
						)}

						{user?.memberType === 'TECHNICIAN' && (
							<Box component="div" className={'stat-item'}>
								<HandymanIcon className="stat-icon" />
								<Typography className={'stat-number'}>{user?.memberProperties}</Typography>
								<Typography className={'stat-label'}>{t('Repair')}</Typography>
							</Box>
						)}

						<Box component="div" className={'stat-item'}>
							<ArticleIcon className={'stat-icon'} />
							<Typography className={'stat-number'}>{user?.memberArticles || 0}</Typography>
							<Typography className={'stat-label'}>{t('Articles')}</Typography>
						</Box>

						<Box component="div" className={'stat-item'}>
							<GroupIcon className={'stat-icon'} />
							<Typography className={'stat-number'}>{user?.memberFollowers || 0}</Typography>
							<Typography className={'stat-label'}>{t('Followers')}</Typography>
						</Box>

						<Box component="div" className={'stat-item'}>
							<PersonAddIcon className={'stat-icon'} />
							<Typography className={'stat-number'}>{user?.memberFollowings || 0}</Typography>
							<Typography className={'stat-label'}>{t('Following')}</Typography>
						</Box>

						<Box component="div" className={'stat-item'}>
							<FavoriteIcon className={'stat-icon'} />
							<Typography className={'stat-number'}>{user?.memberLikes || 0}</Typography>
							<Typography className={'stat-label'}>{t('Likes')}</Typography>
						</Box>
					</Box>
				</Stack>

				<Stack className={'sections'}>
					<Stack className={'section'}>
						<Typography className="title" variant={'h5'}>
							{t('Manage Listings')}
						</Typography>
						<List className={'sub-section'}>
							{user.memberType === 'AGENT' && (
								<>
									<ListItem className={pathname === 'addProperty' ? 'focus' : ''}>
										<Link
											href={{
												pathname: '/mypage',
												query: { category: 'addProperty' },
											}}
											scroll={false}
										>
											<div className={'flex-box'}>
												{category === 'addProperty' ? (
													<img className={'com-icon'} src={'/img/icons/whiteTab.svg'} alt={'com-icon'} />
												) : (
													<img className={'com-icon'} src={'/img/icons/newTab.svg'} alt={'com_icon'} />
												)}
												<Typography className={'sub-title'} variant={'subtitle1'} component={'p'}>
													{t('Add Property')}
												</Typography>
												<IconButton aria-label="delete" sx={{ ml: '40px' }}>
													<PortraitIcon style={{ color: '#ff9736' }} />
												</IconButton>
											</div>
										</Link>
									</ListItem>
									<ListItem className={pathname === 'myProperties' ? 'focus' : ''}>
										<Link
											href={{
												pathname: '/mypage',
												query: { category: 'myProperties' },
											}}
											scroll={false}
										>
											<div className={'flex-box'}>
												{category === 'myProperties' ? (
													<img className={'com-icon'} src={'/img/icons/homeWhite.svg'} alt={'com-icon'} />
												) : (
													<img className={'com-icon'} src={'/img/icons/home.svg'} alt={'com-icon'} />
												)}
												<Typography className={'sub-title'} variant={'subtitle1'} component={'p'}>
													{t('My Properties')}
												</Typography>
												<IconButton aria-label="delete" sx={{ ml: '36px' }}>
													<PortraitIcon style={{ color: '#ff9736' }} />
												</IconButton>
											</div>
										</Link>
									</ListItem>
								</>
							)}

							{user.memberType === 'TECHNICIAN' && (
								<>
									<ListItem className={pathname === 'addRepairProperty' ? 'focus' : ''}>
										<Link
											href={{
												pathname: '/mypage',
												query: { category: 'addRepairProperty' },
											}}
											scroll={false}
										>
											<div className={'flex-box'}>
												{category === 'addRepairProperty' ? (
													<img className={'com-icon'} src={'/img/icons/whiteTab.svg'} alt={'com-icon'} />
												) : (
													<img className={'com-icon'} src={'/img/icons/newTab.svg'} alt={'com_icon'} />
												)}
												<Typography className={'sub-title'} variant={'subtitle1'} component={'p'}>
													{t('Add Repair')}
												</Typography>
												<IconButton aria-label="delete" sx={{ ml: '40px' }}>
													<PortraitIcon style={{ color: '#ff9736' }} />
												</IconButton>
											</div>
										</Link>
									</ListItem>
									<ListItem className={pathname === 'myRepairProperty' ? 'focus' : ''}>
										<Link
											href={{
												pathname: '/mypage',
												query: { category: 'myRepairProperty' },
											}}
											scroll={false}
										>
											<div className={'flex-box'}>
												{category === 'myRepairProperty' ? (
													<img className={'com-icon'} src={'/img/icons/homeWhite.svg'} alt={'com-icon'} />
												) : (
													<img className={'com-icon'} src={'/img/icons/home.svg'} alt={'com-icon'} />
												)}
												<Typography className={'sub-title'} variant={'subtitle1'} component={'p'}>
													{t('My Repair')}
												</Typography>
												<IconButton aria-label="delete" sx={{ ml: '36px' }}>
													<PortraitIcon style={{ color: '#ff9736' }} />
												</IconButton>
											</div>
										</Link>
									</ListItem>
								</>
							)}

							<ListItem className={pathname === 'myFavorites' ? 'focus' : ''}>
								<Link
									href={{
										pathname: '/mypage',
										query: { category: 'myFavorites' },
									}}
									scroll={false}
								>
									<div className={'flex-box'}>
										{category === 'myFavorites' ? (
											<img className={'com-icon'} src={'/img/icons/likeWhite.svg'} alt={'com-icon'} />
										) : (
											<img className={'com-icon'} src={'/img/icons/like.svg'} alt={'com-icon'} />
										)}

										<Typography className={'sub-title'} variant={'subtitle1'} component={'p'}>
											{t('My Favorites')}
										</Typography>
									</div>
								</Link>
							</ListItem>

							<ListItem className={pathname === 'recentlyVisited' ? 'focus' : ''}>
								<Link
									href={{
										pathname: '/mypage',
										query: { category: 'recentlyVisited' },
									}}
									scroll={false}
								>
									<div className={'flex-box'}>
										{category === 'recentlyVisited' ? (
											<img className={'com-icon'} src={'/img/icons/searchWhite.svg'} alt={'com-icon'} />
										) : (
											<img className={'com-icon'} src={'/img/icons/search.svg'} alt={'com-icon'} />
										)}

										<Typography className={'sub-title'} variant={'subtitle1'} component={'p'}>
											{t('Recently Visited')}
										</Typography>
									</div>
								</Link>
							</ListItem>

							<ListItem className={pathname === 'myOrders' ? 'focus' : ''}>
								<Link
									href={{
										pathname: '/mypage',
										query: { category: 'myOrders' },
									}}
									scroll={false}
								>
									<div className={'flex-box'}>
										<ShoppingBagOutlinedIcon
											className="com-icon"
											style={{ color: category === 'myOrders' ? '#fff' : '#000' }}
										/>
										<Typography className={'sub-title'} variant={'subtitle1'} component={'p'}>
											{t('My Orders')}
										</Typography>
									</div>
								</Link>
							</ListItem>

							<ListItem className={pathname === 'followers' ? 'focus' : ''}>
								<Link
									href={{
										pathname: '/mypage',
										query: { category: 'followers' },
									}}
									scroll={false}
								>
									<div className={'flex-box'}>
										<svg
											className={'com-icon'}
											fill={category === 'followers' ? 'white' : 'black'}
											height="16px"
											width="16px"
											version="1.1"
											id="Layer_1"
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 328 328"
										>
											<g id="XMLID_350_">
												<path
													id="XMLID_351_"
													d="M52.25,64.001c0,34.601,28.149,62.749,62.75,62.749c34.602,0,62.751-28.148,62.751-62.749
			S149.602,1.25,115,1.25C80.399,1.25,52.25,29.4,52.25,64.001z"
												/>
												<path
													id="XMLID_352_"
													d="M217.394,262.357c2.929,2.928,6.768,4.393,10.606,4.393c3.839,0,7.678-1.465,10.607-4.394
			c5.857-5.858,5.857-15.356-0.001-21.214l-19.393-19.391l19.395-19.396c5.857-5.858,5.857-15.356-0.001-21.214
			c-5.858-5.857-15.356-5.856-21.214,0.001l-30,30.002c-2.813,2.814-4.393,6.629-4.393,10.607c0,3.979,1.58,7.794,4.394,10.607
			L217.394,262.357z"
												/>
												<path
													id="XMLID_439_"
													d="M15,286.75h125.596c19.246,24.348,49.031,40,82.404,40c57.896,0,105-47.103,105-105
			c0-57.896-47.104-105-105-105c-34.488,0-65.145,16.716-84.297,42.47c-7.764-1.628-15.695-2.47-23.703-2.47
			c-63.411,0-115,51.589-115,115C0,280.034,6.716,286.75,15,286.75z M223,146.75c41.355,0,75,33.645,75,75s-33.645,75-75,75
			s-75-33.645-75-75S181.644,146.75,223,146.75z"
												/>
											</g>
										</svg>
										<Typography className={'sub-title'} variant={'subtitle1'} component={'p'}>
											{t('My Followers')}
										</Typography>
									</div>
								</Link>
							</ListItem>

							<ListItem className={pathname === 'followings' ? 'focus' : ''}>
								<Link
									href={{
										pathname: '/mypage',
										query: { category: 'followings' },
									}}
									scroll={false}
								>
									<div className={'flex-box'}>
										<svg
											className={'com-icon'}
											fill={category === 'followings' ? 'white' : 'black'}
											height="16px"
											width="16px"
											version="1.1"
											id="Layer_1"
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 328 328"
										>
											<g id="XMLID_334_">
												<path
													id="XMLID_337_"
													d="M177.75,64.001C177.75,29.4,149.601,1.25,115,1.25c-34.602,0-62.75,28.15-62.75,62.751
			S80.398,126.75,115,126.75C149.601,126.75,177.75,98.602,177.75,64.001z"
												/>
												<path
													id="XMLID_338_"
													d="M228.606,181.144c-5.858-5.857-15.355-5.858-21.214-0.001c-5.857,5.857-5.857,15.355,0,21.214
			l19.393,19.396l-19.393,19.391c-5.857,5.857-5.857,15.355,0,21.214c2.93,2.929,6.768,4.394,10.607,4.394
			c3.838,0,7.678-1.465,10.605-4.393l30-29.998c2.813-2.814,4.395-6.629,4.395-10.607c0-3.978-1.58-7.793-4.394-10.607
			L228.606,181.144z"
												/>
												<path
													id="XMLID_340_"
													d="M223,116.75c-34.488,0-65.145,16.716-84.298,42.47c-7.763-1.628-15.694-2.47-23.702-2.47
			c-63.412,0-115,51.589-115,115c0,8.284,6.715,15,15,15h125.596c19.246,24.348,49.03,40,82.404,40c57.896,0,105-47.103,105-105
			C328,163.854,280.896,116.75,223,116.75z M223,296.75c-41.356,0-75-33.645-75-75s33.644-75,75-75c41.354,0,75,33.645,75,75
			S264.354,296.75,223,296.75z"
												/>
											</g>
										</svg>

										<Typography className={'sub-title'} variant={'subtitle1'} component={'p'}>
											{t('My Followings')}
										</Typography>
									</div>
								</Link>
							</ListItem>
						</List>
					</Stack>

					<Stack className={'section'}>
						<Typography className="title" variant={'h5'}>
							{t('Community')}
						</Typography>
						<List className={'sub-section'}>
							<ListItem className={pathname === 'myArticles' ? 'focus' : ''}>
								<Link
									href={{
										pathname: '/mypage',
										query: { category: 'myArticles' },
									}}
									scroll={false}
								>
									<div className={'flex-box'}>
										{category === 'myArticles' ? (
											<img className={'com-icon'} src={'/img/icons/discoveryWhite.svg'} alt={'com-icon'} />
										) : (
											<img className={'com-icon'} src={'/img/icons/discovery.svg'} alt={'com-icon'} />
										)}

										<Typography className={'sub-title'} variant={'subtitle1'} component={'p'}>
											{t('Articles')}
										</Typography>
									</div>
								</Link>
							</ListItem>
							<ListItem className={pathname === 'writeArticle' ? 'focus' : ''}>
								<Link
									href={{
										pathname: '/mypage',
										query: { category: 'writeArticle' },
									}}
									scroll={false}
								>
									<div className={'flex-box'}>
										{category === 'writeArticle' ? (
											<img className={'com-icon'} src={'/img/icons/whiteTab.svg'} alt={'com-icon'} />
										) : (
											<img className={'com-icon'} src={'/img/icons/newTab.svg'} alt={'com_icon'} />
										)}
										<Typography className={'sub-title'} variant={'subtitle1'} component={'p'}>
											{t('Write Article')}
										</Typography>
									</div>
								</Link>
							</ListItem>
						</List>
					</Stack>
					<Stack className={'section'}>
						<Typography className="title" variant={'h5'}>
							{t('Manage Account')}
						</Typography>
						<List className={'sub-section'}>
							<ListItem className={pathname === 'myProfile' ? 'focus' : ''}>
								<Link
									href={{
										pathname: '/mypage',
										query: { category: 'myProfile' },
									}}
									scroll={false}
								>
									<div className="flex-box">
										<AccountCircleOutlinedIcon
											className="com-icon"
											style={{ color: category === 'myProfile' ? '#fff' : '#000' }}
										/>
										<Typography className="sub-title" variant="subtitle1" component="p">
											{t('My Profile')}
										</Typography>
									</div>
								</Link>
							</ListItem>
							<ListItem onClick={logoutHandler}>
								<div className={'flex-box'}>
									<img className={'com-icon'} src={'/img/icons/logout.svg'} alt={'com-icon'} />
									<Typography className={'sub-title'} variant={'subtitle1'} component={'p'}>
										{t('Logout')}
									</Typography>
								</div>
							</ListItem>
						</List>
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

export default MyMenu;
