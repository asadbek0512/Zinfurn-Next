import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import Top from '../Top';
import { Stack } from '@mui/material';
import { updateUserInfo, setJwtToken } from '../../auth';
import Chat from '../Chat';
import AiChat from '../AiChat';
import SalePromoModal from '../common/SalePromoModal';
import { useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { GET_MY_PROFILE } from '../../../apollo/user/query';
import { useTranslation } from 'next-i18next';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import Footer from '../Footer';
import SalesToast from '../common/SalesToast';
import LinkAccountToast from '../common/LinkAccountToast';

const withLayoutBasic = (Component: any) => {
	return (props: any) => {
		const router = useRouter();
		const { t, i18n } = useTranslation('common');
		const device = useDeviceDetect();
		const [authHeader, setAuthHeader] = useState<boolean>(false);
		const user = useReactiveVar(userVar);
		const isJoinPage = router.pathname === '/account/join';

		const memoizedValues = useMemo(() => {
			let title = '',
				desc = '',
				bgImage = '';

			switch (router.pathname) {
				case '/property':
					title = 'Property Search';
					desc = 'We are glad to see you again!';
					bgImage = '/img/banner/83.jpg';
					break;
				case '/agent':
					title = 'Agents';
					desc = 'Home / Agents';
					bgImage = '/img/banner/257.jpg';
					break;
				case '/agent/detail':
					title = 'Agent Page';
					desc = 'Home / Agents';
					bgImage = '/img/banner/agent9.jpeg';
					break;
				case '/repairService':
					title = 'Service Page';
					desc = 'Home / Repair Service';
					bgImage = '/img/banner/service2.jpg';
					break;
				case '/mypage':
					title = 'My Page';
					desc = 'Home / My Account';
					bgImage = '/img/banner/8888.jpg';
					break;
				case '/community':
					title = 'Community';
					desc = 'Home / Community';
					bgImage = '/img/banner/service1.jpg';
					break;
				case '/community/detail':
					title = 'Community Detail';
					desc = 'Home / Community';
					bgImage = '/img/banner/service1.jpg';
					break;
				case '/cs':
					title = 'Customer Support';
					desc = 'We are glad to see you again!';
					bgImage = '/img/banner/slider-02.webp';
					break;
				case '/member':
					title = 'Member Page';
					desc = 'Home / Members';
					bgImage = '/img/banner/agent9.jpeg';
					break;
				case '/about':
					title = 'About Zinfurn';
					desc = 'Home / About';
					bgImage = '/img/banner/Home-1-.jpg';
					break;
				default:
					break;
			}

			return { title, desc, bgImage };
		}, [router.pathname]);

		const { data: myProfileData } = useQuery(GET_MY_PROFILE, {
			fetchPolicy: 'network-only',
			onError: () => {},
		});

		/** LIFECYCLES **/
		useEffect(() => {
			if (myProfileData?.getMyProfile) {
				const member = myProfileData.getMyProfile;
				userVar({
					_id: member._id ?? '',
					memberType: member.memberType ?? '',
					memberStatus: member.memberStatus ?? '',
					memberAuthType: member.memberAuthType ?? '',
					memberPhone: member.memberPhone ?? '',
					memberNick: member.memberNick ?? '',
					memberFullName: member.memberFullName ?? '',
					memberImage: member.memberImage || '/img/profile/defaultUser.svg',
					memberAddress: member.memberAddress ?? '',
					memberDesc: member.memberDesc ?? '',
					memberProperties: member.memberProperties ?? 0,
					memberRank: member.memberRank ?? 0,
					memberEmail: member.memberEmail ?? '',
					memberArticles: member.memberArticles ?? 0,
					memberPoints: member.memberPoints ?? 0,
					memberFollowers: member.memberFollowers ?? 0,
					memberFollowings: member.memberFollowings ?? 0,
					memberLikes: member.memberLikes ?? 0,
					memberViews: member.memberViews ?? 0,
					memberWarnings: member.memberWarnings ?? 0,
					memberBlocks: member.memberBlocks ?? 0,
					memberTelegramId: member.memberTelegramId ?? '',
					memberGoogleId: member.memberGoogleId ?? '',
				});
			}
		}, [myProfileData]);

		/** HANDLERS **/

		if (device == 'mobile') {
			return (
				<>
					<Stack id="mobile-wrap">
						<Stack id={'top'}>
							<Top />
						</Stack>

						{!isJoinPage && memoizedValues.bgImage && router.pathname !== '/repairService' && router.pathname !== '/mypage' && router.pathname !== '/member' && (
							<Stack
								className="mob-header-basic"
								style={{
									backgroundImage: `url(${memoizedValues.bgImage})`,
								}}
							>
								<Stack className="mob-header-content">
									<strong>{t(memoizedValues.title)}</strong>
									<span>{t(memoizedValues.desc)}</span>
								</Stack>
							</Stack>
						)}

						<Stack id={'main'}>
							<Component {...props} />
						</Stack>

						<Stack id={'footer'}>
							<Footer />
						</Stack>

						<Chat />
						<AiChat />
						<LinkAccountToast />
						<SalePromoModal />
					</Stack>
				</>
			);
		} else {
			return (
				<>
					<Stack id="pc-wrap">
						<Stack id={'top'}>
							<Top />
						</Stack>

						{!isJoinPage && (
							<Stack
								className={`header-basic ${authHeader && 'auth'}`}
								style={{
									backgroundImage: `url(${memoizedValues.bgImage})`,
									backgroundSize: 'cover',
									boxShadow: 'inset 10px 40px 150px 40px rgb(24 22 36)',
								}}
							>
								<Stack className={'container'}>
									<strong>{t(memoizedValues.title)}</strong>
									<span>{t(memoizedValues.desc)}</span>
								</Stack>
							</Stack>
						)}

						<Stack id={'main'}>
							<Component {...props} />
						</Stack>

						<Chat />

						<AiChat />

						<Stack id={'footer'}>
							<Footer />
						</Stack>

						<SalesToast />
						<LinkAccountToast />
						<SalePromoModal />
					</Stack>
				</>
			);
		}
	};
};

export default withLayoutBasic;
