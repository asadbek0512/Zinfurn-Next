import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { NextPage } from 'next';
import { Stack } from '@mui/material';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import MyProperties from '../../libs/components/mypage/MyProperties';
import MyFavorites from '../../libs/components/mypage/MyFavorites';
import RecentlyVisited from '../../libs/components/mypage/RecentlyVisited';
import AddProperty from '../../libs/components/mypage/AddNewProperty';
import MyProfile from '../../libs/components/mypage/MyProfile';
import MyArticles from '../../libs/components/mypage/MyArticles';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '../../apollo/store';
import MyMenu from '../../libs/components/mypage/MyMenu';
import WriteArticle from '../../libs/components/mypage/WriteArticle';
import MemberFollowers from '../../libs/components/member/MemberFollowers';
import { sweetErrorHandling, sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import MemberFollowings from '../../libs/components/member/MemberFollowings';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { LIKE_TARGET_MEMBER, SUBSCRIBE, UNSUBSCRIBE } from '../../apollo/user/mutation';
import { Messages } from '../../libs/config';
import AddRepairProperty from '../../libs/components/mypage/AddNewRepairProperty';
import MyRepairProperty from '../../libs/components/mypage/MyRepairProperty';
import MyOrders from '../../libs/components/mypage/MyOrders';
import MyMessages from '../../libs/components/mypage/MyMessages';
import { GET_MY_PROFILE } from '../../apollo/user/query';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import { useTranslation } from 'next-i18next';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const MyPage: NextPage = () => {
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const router = useRouter();
	const { t } = useTranslation('common');
	const category: any = router.query?.category ?? 'myProfile';
	const [isLoading, setIsLoading] = useState(true);

	/** APOLLO REQUESTS **/
	const [subscribe] = useMutation(SUBSCRIBE);
	const [unsubscribe] = useMutation(UNSUBSCRIBE);
	const [likeTargetMember] = useMutation(LIKE_TARGET_MEMBER);
	const { loading: profileLoading } = useQuery(GET_MY_PROFILE, {
		fetchPolicy: 'cache-first',
		onError: () => {},
	});

	/** LIFECYCLES **/
	useEffect(() => {
		if (!profileLoading) {
			setIsLoading(false);
		}
	}, [profileLoading]);

	useEffect(() => {
		if (!isLoading && !user._id) {
			router.push('/').then();
		}
	}, [user, isLoading]);

	if (isLoading) {
		return <div>Loading...</div>;
	}

	/** HANDLERS **/
	const subscribeHandler = async (id: string, refetch: any, query: any) => {
		try {
			console.log('id: ', id);
			if (!id) throw new Error(Messages.error1);
			if (!user._id) throw new Error(Messages.error2);

			await subscribe({
				variables: {
					input: id,
				},
			});
			await sweetTopSmallSuccessAlert('Subscribe', 800);
			await refetch({ input: query })
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	const unsubscribeHandler = async (id: string, refetch: any, query: any) => {
		try {
			if (!id) throw new Error(Messages.error1);
			if (!user._id) throw new Error(Messages.error2);

			await unsubscribe({
				variables: {
					input: id,
				},
			});
			await sweetTopSmallSuccessAlert('Unsubscribe', 800);
			await refetch({ input: query })
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};
	const likeMemberHandler = async (id: string, refetch: any, query: any) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Messages.error2);
			
			await likeTargetMember({
				variables: {
					input: id,
				},
			});
			await sweetTopSmallSuccessAlert("Success!", 808);
			await refetch({ input: query })
		} catch (err: any) {
			console.log('ERROR, likeMemberHandler:', err.message);
			sweetMixinErrorAlert(err.message).then()
		}
	};

	const redirectToMemberPageHandler = async (memberId: string) => {
		try {
			if (memberId === user?._id) await router.push(`/mypage?memberId=${memberId}`);
			else await router.push(`/member?memberId=${memberId}`);
		} catch (error) {
			await sweetErrorHandling(error);
		}
	};

	if (device === 'mobile') {
		const mobileCategory = router.query?.category as string | undefined;

		if (!mobileCategory) {
			return <MyMenu />;
		}

		return (
			<div id="mob-mypage">
				<div className="mob-mypage-back" onClick={() => router.push('/mypage')}>
					<ArrowBackIosNewIcon sx={{ fontSize: 13 }} />
					<span>{t('My Page')}</span>
				</div>
				{mobileCategory === 'addProperty' && <AddProperty />}
				{mobileCategory === 'addRepairProperty' && <AddRepairProperty />}
				{mobileCategory === 'myProperties' && <MyProperties />}
				{mobileCategory === 'myRepairProperty' && <MyRepairProperty />}
				{mobileCategory === 'myFavorites' && <MyFavorites />}
				{mobileCategory === 'recentlyVisited' && <RecentlyVisited />}
				{mobileCategory === 'myArticles' && <MyArticles />}
				{mobileCategory === 'writeArticle' && <WriteArticle />}
				{mobileCategory === 'myProfile' && <MyProfile />}
				{mobileCategory === 'myOrders' && <MyOrders />}
				{mobileCategory === 'myMessages' && <MyMessages />}
				{mobileCategory === 'followers' && (
					<MemberFollowers
						subscribeHandler={subscribeHandler}
						unsubscribeHandler={unsubscribeHandler}
						likeMemberHandler={likeMemberHandler}
						redirectToMemberPageHandler={redirectToMemberPageHandler}
					/>
				)}
				{mobileCategory === 'followings' && (
					<MemberFollowings
						subscribeHandler={subscribeHandler}
						unsubscribeHandler={unsubscribeHandler}
						likeMemberHandler={likeMemberHandler}
						redirectToMemberPageHandler={redirectToMemberPageHandler}
					/>
				)}
			</div>
		);
	} else {
		return (
			<div id="my-page" style={{ position: 'relative' }}>
				<div className="container">
					<Stack className={'my-page'}>
						
						<Stack className={'back-frame'}>
							<Stack className={'left-config'}>
								<MyMenu />
							</Stack>
							<Stack className="main-config" mb={'76px'}>
								<Stack className={'list-config'}>
									{category === 'addProperty' && <AddProperty />}
									{category === 'addRepairProperty' && <AddRepairProperty />}
									{category === 'myProperties' && <MyProperties />}
									{category === 'myRepairProperty' && <MyRepairProperty />}
									{category === 'myFavorites' && <MyFavorites />}
									{category === 'recentlyVisited' && <RecentlyVisited />}
									{category === 'myArticles' && <MyArticles />}
									{category === 'writeArticle' && <WriteArticle />}
									{category === 'myProfile' && <MyProfile />}
									{category === 'myOrders' && <MyOrders />}
									{category === 'myMessages' && <MyMessages />}
									{category === 'followers' && (
										<MemberFollowers
											subscribeHandler={subscribeHandler}
											unsubscribeHandler={unsubscribeHandler}
											likeMemberHandler={likeMemberHandler}
											redirectToMemberPageHandler={redirectToMemberPageHandler}
										/>
									)}
									{category === 'followings' && (
										<MemberFollowings
											subscribeHandler={subscribeHandler}
											unsubscribeHandler={unsubscribeHandler}
											likeMemberHandler={likeMemberHandler}
											redirectToMemberPageHandler={redirectToMemberPageHandler}
										/>
									)}
								</Stack>
							</Stack>
						</Stack>
					</Stack>
				</div>
			</div>
		);
	}
};

export default withLayoutBasic(MyPage);
