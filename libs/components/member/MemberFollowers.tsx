import React, { ChangeEvent, useEffect, useState } from 'react';
import { Box, Button, Pagination, Stack, Typography } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { useRouter } from 'next/router';
import { FollowInquiry } from '../../types/follow/follow.input';
import { Follower } from '../../types/follow/follow';
import { REACT_APP_API_URL } from '../../config';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { userVar } from '../../../apollo/store';
import { T } from '../../types/common';
import { GET_MEMBER_FOLLOWERS } from '../../../apollo/user/query';
import { useTranslation } from 'next-i18next';
import { useQuery, useReactiveVar } from '@apollo/client';

interface MemberFollowsProps {
	initialInput: FollowInquiry;
	subscribeHandler: any;
	unsubscribeHandler: any;
	likeMemberHandler: any;
	redirectToMemberPageHandler: any;
}

const MemberFollowers = (props: MemberFollowsProps) => {
	const { t } = useTranslation('common');
	const { initialInput, subscribeHandler, unsubscribeHandler, likeMemberHandler, redirectToMemberPageHandler } = props;
	const device = useDeviceDetect();
	const router = useRouter();
	const [total, setTotal] = useState<number>(0);
	const category: any = router.query?.category ?? 'properties';
	const [followInquiry, setFollowInquiry] = useState<FollowInquiry>(initialInput);
	const [memberFollowers, setMemberFollowers] = useState<Follower[]>([]);
	const user = useReactiveVar(userVar);

	/** APOLLO REQUESTS **/
	const {
		loading: getMemberFollowersLoading,
		data: getMemberFollowersData,
		error: getMemberFollowersError,
		refetch: getMemberFollowersRefetch,
	} = useQuery(GET_MEMBER_FOLLOWERS, {
		fetchPolicy: 'network-only',
		variables: { input: followInquiry },
		skip: !followInquiry?.search.followingId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setMemberFollowers(data?.getMemberFollowers?.list);
			setTotal(data?.getMemberFollowers?.metaCounter[0]?.total);
		},
	});

	/** LIFECYCLES **/
	useEffect(() => {
		if (router.query.memberId)
			setFollowInquiry({ ...followInquiry, search: { followingId: router.query.memberId as string } });
		else setFollowInquiry({ ...followInquiry, search: { followingId: user?._id } });
	}, [router]);

	useEffect(() => {
		getMemberFollowersRefetch({ input: followInquiry }).then();
	}, [followInquiry]);

	/** HANDLERS **/
	const paginationHandler = async (event: ChangeEvent<unknown>, value: number) => {
		followInquiry.page = value;
		setFollowInquiry({ ...followInquiry });
	};

	if (device === 'mobile') {
		return (
			<div id="mob-myfollows">
				<div className="mob-myfollows-header">
					<h2>{t('My Followers')}</h2>
				</div>
				<div className="mob-myfollows-list">
					{memberFollowers?.length === 0 ? (
						<div className="mob-myfollows-empty">
							<img src="/img/icons/icoAlert.svg" alt="" />
							<span>{t('No Followers yet!')}</span>
						</div>
					) : (
						memberFollowers.map((follower: Follower) => {
							const imagePath = follower?.followerData?.memberImage
								? follower.followerData.memberImage.startsWith('http')
									? follower.followerData.memberImage
									: `${REACT_APP_API_URL}/${follower.followerData.memberImage}`
								: '/img/profile/defaultUser.svg';
							const isFollowing = follower.meFollowed?.[0]?.myFollowing;
							const isLiked = follower.meLiked?.[0]?.myFavorite;
							return (
								<div key={follower._id} className="mob-myfollows-card">
									<img
										src={imagePath}
										alt=""
										onClick={() => follower?.followerData?._id && redirectToMemberPageHandler(follower.followerData._id)}
									/>
									<div className="mob-myfollows-info">
										<div className="mob-myfollows-nick">{follower?.followerData?.memberNick}</div>
										<div className="mob-myfollows-type">{t(follower?.followerData?.memberType || '')}</div>
									</div>
									<div className="mob-myfollows-actions">
										<button
											className="like"
											onClick={() => likeMemberHandler(follower?.followerData?._id, getMemberFollowersRefetch, followInquiry)}
										>
											{isLiked ? <FavoriteIcon sx={{ fontSize: 14, color: 'var(--danger)' }} /> : <FavoriteBorderIcon sx={{ fontSize: 14 }} />}
										</button>
										{user?._id !== follower?.followerId && (
											isFollowing ? (
												<button
													className="unfollow"
													onClick={() => unsubscribeHandler(follower?.followerData?._id, getMemberFollowersRefetch, followInquiry)}
												>
													{t('Unfollow')}
												</button>
											) : (
												<button
													className="follow"
													onClick={() => subscribeHandler(follower?.followerData?._id, getMemberFollowersRefetch, followInquiry)}
												>
													{t('Follow')}
												</button>
											)
										)}
									</div>
								</div>
							);
						})
					)}
				</div>
				{memberFollowers?.length > 0 && (
					<Stack className="pagination-config">
						<Stack className="pagination-box">
							<Pagination
								count={Math.ceil(total / followInquiry.limit)}
								page={followInquiry.page}
								shape="circular"
								color="primary"
								onChange={paginationHandler}
							/>
						</Stack>
						<Stack className="total-result">
							<Typography>{t('{{total}} followers', { total })}</Typography>
						</Stack>
					</Stack>
				)}
			</div>
		);
	} else {
		return (
			<div id="member-follows-page">
				<Stack className="main-title-box">
					<Stack className="right-box">
						<Typography className="main-title">
							{category === 'followers' ? t('Followers') : t('Followings')}
						</Typography>
					</Stack>
				</Stack>
				<Stack className="follows-list-box">
					<Stack className="listing-title-box">
						<Typography className="title-text">{t('Name')}</Typography>
						<Typography className="title-text">{t('Details')}</Typography>
						<Typography className="title-text">{t('Subscription')}</Typography>
					</Stack>
					{memberFollowers?.length === 0 && (
						<div className={'no-data'}>
							<img src="/img/icons/icoAlert.svg" alt="" />
							<p>{t('No Followers yet!')}</p>
						</div>
					)}
					{memberFollowers.map((follower: Follower) => {
						const imagePath: string = follower?.followerData?.memberImage
							? (follower?.followerData?.memberImage?.startsWith('http') ? follower?.followerData?.memberImage : `${REACT_APP_API_URL}/${follower?.followerData?.memberImage}`)
							: '/img/profile/defaultUser.svg';
						return (
							<Stack className="follows-card-box" key={follower._id}>
								<Stack className={'info'} onClick={() => follower?.followerData?._id && redirectToMemberPageHandler(follower.followerData._id)}>
									<Stack className="image-box">
										<img src={imagePath} alt="" />
									</Stack>
									<Stack className="information-box">
										<Typography className="name">{follower?.followerData?.memberNick}</Typography>
									</Stack>
								</Stack>
								<Stack className={'details-box'}>
									<Box className={'info-box'} component={'div'}>
										<p>{t('Followers_count')}</p>
										<span>({follower?.followerData?.memberFollowers})</span>
									</Box>
									<Box className={'info-box'} component={'div'}>
										<p>{t('Followings_count')}</p>
										<span>({follower?.followerData?.memberFollowings})</span>
									</Box>
									<Box className={'info-box'} component={'div'}>
										{follower?.meLiked && follower?.meLiked[0]?.myFavorite ? (
											<FavoriteIcon
												color="primary"
												onClick={() =>
													likeMemberHandler(follower?.followerData?._id, getMemberFollowersRefetch, followInquiry)
												}
											/>
										) : (
											<FavoriteBorderIcon
												onClick={() =>
													likeMemberHandler(follower?.followerData?._id, getMemberFollowersRefetch, followInquiry)
												}
											/>
										)}
										<span>({follower?.followerData?.memberLikes})</span>
									</Box>
								</Stack>
								{user?._id !== follower?.followerId && (
									<Stack className="action-box">
										{follower.meFollowed && follower.meFollowed[0]?.myFollowing ? (
											<>
												<Typography>{t('Following')}</Typography>
												<Button
													variant="outlined"
													sx={{ background: '#ed5858', ':hover': { background: '#ee7171' } }}
													onClick={() =>
														unsubscribeHandler(follower?.followerData?._id, getMemberFollowersRefetch, followInquiry)
													}
												>
													{t('Unfollow')}
												</Button>
											</>
										) : (
											<Button
												variant="contained"
												sx={{ background: '#60eb60d4', ':hover': { background: '#60eb60d4' } }}
												onClick={() =>
													subscribeHandler(follower?.followerData?._id, getMemberFollowersRefetch, followInquiry)
												}
											>
												{t('Follow')}
											</Button>
										)}
									</Stack>
								)}
							</Stack>
						);
					})}
				</Stack>
				{memberFollowers.length !== 0 && (
					<Stack className="pagination-config">
						<Stack className="pagination-box">
							<Pagination
								page={followInquiry.page}
								count={Math.ceil(total / followInquiry.limit)}
								onChange={paginationHandler}
								shape="circular"
								color="primary"
							/>
						</Stack>
						<Stack className="total-result">
							<Typography>{t('{{total}} followers', { total })}</Typography>
						</Stack>
					</Stack>
				)}
			</div>
		);
	}
};

MemberFollowers.defaultProps = {
	initialInput: {
		page: 1,
		limit: 5,
		search: {
			followingId: '',
		},
	},
};

export default MemberFollowers;
