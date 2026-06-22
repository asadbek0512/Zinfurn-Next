import React, { useEffect } from 'react';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import Top from '../Top';
import { Stack } from '@mui/material';
import FiberContainer from '../common/FiberContainer';
// import HeaderFilter from '../homepage/HeaderFilter';
import { userVar } from '../../../apollo/store';
import { useQuery, useReactiveVar } from '@apollo/client';
import { getJwtToken, updateUserInfo } from '../../auth';
import Chat from '../Chat';
import AiChat from '../AiChat';
import SalePromoModal from '../common/SalePromoModal';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import Footer from '../Footer';
import HeaderFilter from '../homepage/HeaderFilter';
import HeroSection from '../common/HeroSection';
import SalesToast from '../common/SalesToast';
import { GET_MY_PROFILE } from '../../../apollo/user/query';

const withLayoutMain = (Component: any) => {
	return (props: any) => {
		const device = useDeviceDetect();
		const user = useReactiveVar(userVar);

		const { data: myProfileData } = useQuery(GET_MY_PROFILE, {
			fetchPolicy: 'network-only',
			onError: () => {},
		});

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

						<div className={'mobile-header-main'}>
							<HeroSection />
						</div>

						<Stack id={'main'}>
							<Component {...props} />
						</Stack>

						<Stack id={'footer'}>
							<Footer />
						</Stack>

						<Chat />
						<AiChat />
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

						<Stack className={'header-main'}>
							{/* <FiberContainer /> */}
							<HeroSection />
							<Stack className={'container'}>
								<HeaderFilter />
							</Stack>
						</Stack>

						<Stack id={'main'}>
							<Component {...props} />
						</Stack>

						<Chat />
						
						<AiChat />

						<Stack id={'footer'}>
							<Footer />
						</Stack>

						<SalesToast />
						<SalePromoModal />
					</Stack>
				</>
			);
		}
	};
};

export default withLayoutMain;
