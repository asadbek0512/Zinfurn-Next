import React, { ChangeEvent, useEffect, useState } from 'react';
import { Avatar, Box, Button, CircularProgress, IconButton, Stack, Typography } from '@mui/material';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutFull from '../../libs/components/layout/LayoutFull';
import { NextPage } from 'next';
import SwiperCore, { Autoplay, Navigation, Pagination } from 'swiper';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { useRouter } from 'next/router';
import moment from 'moment';
import { REACT_APP_API_URL } from '../../libs/config';
import { userVar } from '../../apollo/store';
import { CommentInput, CommentsInquiry } from '../../libs/types/comment/comment.input';
import { Comment } from '../../libs/types/comment/comment';
import { CommentGroup } from '../../libs/enums/comment.enum';
import { Pagination as MuiPagination } from '@mui/material';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import 'swiper/css';
import 'swiper/css/pagination';
import { GET_COMMENTS, GET_REPAIRPROPERTIES, GET_REPAIRPROPERTY } from '../../apollo/user/query';
import { T } from '../../libs/types/common';
import { CREATE_COMMENT, LIKE_TARGET_REPAIRPROPERTY } from '../../apollo/user/mutation';
import { sweetErrorHandling, sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import { Direction, Message } from '../../libs/enums/common.enum';
import { RepairProperty } from '../../libs/types/repairProperty/repairProperty';
import Review from '../../libs/components/property/Review';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import RateReviewIcon from '@mui/icons-material/RateReview';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import SendIcon from '@mui/icons-material/Send';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DescriptionIcon from '@mui/icons-material/Description';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PhoneIcon from '@mui/icons-material/Phone';
import { useTranslation } from 'next-i18next';

SwiperCore.use([Autoplay, Navigation, Pagination]);

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const RepairPropertyDetail: NextPage = ({ initialComment, ...props }: any) => {
	const { t } = useTranslation('common');
	const device = useDeviceDetect();
	const router = useRouter();
	const user = useReactiveVar(userVar);
	dayjs.extend(relativeTime);
	const [repairPropertyId, setRepairPropertyId] = useState<string | null>(null);
	const [repairProperty, setRepairProperty] = useState<RepairProperty | null>(null);
	const [slideImage, setSlideImage] = useState<string>('');
	const [destinationRepairProperties, setDestinationRepairProperties] = useState<RepairProperty[]>([]);

	const [commentInquiry, setCommentInquiry] = useState<CommentsInquiry>(initialComment);
	const [repairPropertyComments, setRepairPropertyComments] = useState<Comment[]>([]);
	const [commentTotal, setCommentTotal] = useState<number>(0);

	const [insertCommentData, setInsertCommentData] = useState<CommentInput>({
		commentGroup: CommentGroup.REPAIR_PROPERTY,
		commentContent: '',
		commentRefId: '',
	});
	const [showEmoji, setShowEmoji] = useState(false);
	const insertEmoji = (emoji: string) => setInsertCommentData((prev) => ({ ...prev, commentContent: prev.commentContent + emoji }));

	/** APOLLO REQUESTS **/
	const [likeRepairProperty] = useMutation(LIKE_TARGET_REPAIRPROPERTY);
	const [createRepairComment] = useMutation(CREATE_COMMENT);

	const {
		loading: getRepairPropertyLoading,
		data: getRepairPropertyData,
		error: getRepairPropertyError,
		refetch: getRepairPropertyRefetch,
	} = useQuery(GET_REPAIRPROPERTY, {
		fetchPolicy: 'network-only',
		variables: { input: repairPropertyId },
		skip: !repairPropertyId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			if (data?.getRepairProperty) setRepairProperty(data?.getRepairProperty);
			if (data?.getRepairProperty) setSlideImage(data?.getRepairProperty?.repairPropertyImages?.[0]);
		},
	});

	const {
		loading: getRepairPropertiesLoading,
		data: getRepairPropertiesData,
		error: getRepairPropertiesError,
		refetch: getRepairPropertiesRefetch,
	} = useQuery(GET_REPAIRPROPERTIES, {
		fetchPolicy: 'cache-and-network',
		variables: {
			input: {
				page: 1,
				limit: 4,
				sort: 'createdAt',
				direction: Direction.DESC,
				search: {
					typeList: repairProperty?.repairPropertyType ? [repairProperty.repairPropertyType] : [],
				},
			},
		},
		skip: !repairPropertyId && !repairProperty,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			if (data?.getRepairProperties?.list) setDestinationRepairProperties(data?.getRepairProperties?.list);
		},
	});

	const {
		loading: getCommentsLoading,
		data: getCommentsData,
		error: getCommentsError,
		refetch: getCommentsRefetch,
	} = useQuery(GET_COMMENTS, {
		fetchPolicy: 'cache-and-network',
		variables: {
			input: initialComment,
		},
		skip: !commentInquiry.search.commentRefId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			if (data?.getComments?.list) setRepairPropertyComments(data?.getComments?.list);
			setCommentTotal(data?.getComments?.metaCounter[0]?.total ?? 0);
		},
	});

	/** LIFECYCLES **/
	useEffect(() => {
		if (router.query.id) {
			setRepairPropertyId(router.query.id as string);
			setCommentInquiry({
				...commentInquiry,
				search: {
					commentRefId: router.query.id as string,
				},
			});
			setInsertCommentData({
				...insertCommentData,
				commentRefId: router.query.id as string,
			});
		}
	}, [router]);

	useEffect(() => {
		if (commentInquiry.search.commentRefId) {
			getCommentsRefetch({ input: commentInquiry });
		}
	}, [commentInquiry]);

	/** HANDLERS **/
	const changeImageHandler = (image: string) => {
		setSlideImage(image);
	};

	const likeRepairPropertyHandler = async (user: T, id: string) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(t(Message.NOT_AUTHENTICATED));

			await likeRepairProperty({ variables: { input: id } });

			await getRepairPropertyRefetch({ input: id });
			await getRepairPropertiesRefetch({
				input: {
					page: 1,
					limit: 4,
					sort: 'createdAt',
					direction: Direction.DESC,
					search: {
						typeList: [repairProperty?.repairPropertyType],
					},
				},
			});
		} catch (err: any) {
			console.log('ERROR, likeRepairPropertyHandler', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const getRatingByMemberType = (type: string) => {
		switch (type) {
			case 'ADMIN':
				return { score: '5.0', stars: '★★★★★' };
			case 'TECHNICIAN':
				return { score: '4.5', stars: '★★★★☆' };
			case 'AGENT':
				return { score: '3.5', stars: '★★★☆☆' };
			case 'USER':
				return { score: '3.0', stars: '★★☆☆☆' };
			default:
				return { score: '0.0', stars: '☆☆☆☆☆' };
		}
	};

	const commentPaginationChangeHandler = async (_event: ChangeEvent<unknown>, value: number) => {
		const updatedInquiry = { ...commentInquiry, page: value };
		setCommentInquiry(updatedInquiry);
	};

	const createCommentHandler = async () => {
		try {
			if (!user._id) throw Error(t(Message.NOT_AUTHENTICATED));
			await createRepairComment({ variables: { input: insertCommentData } });

			setInsertCommentData({ ...insertCommentData, commentContent: '' });

			await getCommentsRefetch({ input: commentInquiry });
			sweetTopSmallSuccessAlert(t('Review submitted successfully!'), 700);
		} catch (err) {
			await sweetErrorHandling(err);
		}
	};

	if (getRepairPropertiesLoading) {
		if (device === 'mobile') {
			return <Stack sx={{ justifyContent: 'center', alignItems: 'center', width: '100%', height: '100vh' }}><CircularProgress size={'2rem'} sx={{ color: '#cf6422' }} /></Stack>;
		}
		return <Stack sx={{ justifyContent: 'center', alignItems: 'center', width: '100%', height: '1800px' }}><CircularProgress size={'4rem'} /></Stack>;
	}

	if (device === 'mobile') {
		const techAvatar = repairProperty?.memberData?.memberImage?.startsWith('http')
			? repairProperty.memberData.memberImage
			: `${REACT_APP_API_URL}/${repairProperty?.memberData?.memberImage || ''}`;

		return (
			<div id="mob-repair-detail-page">
				{/* Back */}
				<div className="mob-rpd-back" onClick={() => router.push('/repairService')}>
					<ArrowBackIosIcon sx={{ fontSize: 15 }} />
					{t('Back to property')}
				</div>

				{/* Main image */}
				<img
					className="mob-rpd-img"
					src={slideImage ? `${REACT_APP_API_URL}/${slideImage}` : '/img/property/bigImage.png'}
					alt=""
				/>

				{/* Info */}
				<div className="mob-rpd-info">
					<div className="mob-rpd-technician">
						<img src={techAvatar} alt="" className="mob-rpd-tech-avatar" />
						<div>
							<p className="mob-rpd-tech-name">{repairProperty?.memberData?.memberNick}</p>
							<p className="mob-rpd-tech-role">{t('Technician')}</p>
						</div>
					</div>

					<div className="mob-rpd-stats">
						<span className="mob-rpd-stat">
							<RemoveRedEyeIcon />
							{repairProperty?.repairPropertyViews ?? 0}
						</span>
						<button
							className={`mob-rpd-like-btn ${repairProperty?.meLiked?.[0]?.myFavorite ? 'liked' : ''}`}
							onClick={() => repairProperty?._id && likeRepairPropertyHandler(user, repairProperty._id)}
						>
							<FavoriteIcon />
							{repairProperty?.repairPropertyLikes ?? 0}
						</button>
					</div>

					{repairProperty?.repairPropertyAddress && (
						<div className="mob-rpd-row">
							<LocationOnIcon />
							<span>{repairProperty.repairPropertyAddress}</span>
						</div>
					)}
					{repairProperty?.memberData?.memberPhone && (
						<div className="mob-rpd-row">
							<PhoneIcon />
							<span>{repairProperty.memberData.memberPhone}</span>
						</div>
					)}
					{repairProperty?.repairPropertyDescription && (
						<div className="mob-rpd-row">
							<DescriptionIcon />
							<span>{repairProperty.repairPropertyDescription}</span>
						</div>
					)}
					<span className="mob-rpd-date">
						{moment(repairProperty?.createdAt).format('YYYY-MM-DD HH:mm')}
					</span>
				</div>

				{/* Reviews */}
				<div className="mob-rpd-reviews">
					<div className="mob-rpd-rev-write">
						<div className="mob-rpd-rev-heading">
							<RateReviewIcon sx={{ color: '#d89801', fontSize: 18 }} />
							<span>{t('write_a_review')}</span>
						</div>
						{showEmoji && (
							<div className="mob-rpd-emoji-panel">
								{['😊','👍','❤️','⭐','🔥','🙏','😍','💯','🎉','😅','👌','✨'].map((e) => (
									<button key={e} className="mob-rpd-emoji-item" onClick={() => insertEmoji(e)}>{e}</button>
								))}
							</div>
						)}
						<div className="mob-rpd-input-row">
							<IconButton className={`mob-rpd-emoji-btn ${showEmoji ? 'active' : ''}`} onClick={() => setShowEmoji((v) => !v)} size="small">
								<EmojiEmotionsIcon />
							</IconButton>
							<textarea
								className="mob-rpd-textarea"
								rows={1}
								placeholder={user?._id ? t('write_a_review') : t('login_to_review')}
								value={insertCommentData.commentContent}
								disabled={!user?._id}
								onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (insertCommentData.commentContent.trim() && user?._id) createCommentHandler(); } }}
								onChange={({ target: { value } }) => setInsertCommentData({ ...insertCommentData, commentContent: value })}
							/>
							<IconButton className="mob-rpd-send-btn" disabled={!insertCommentData.commentContent.trim() || !user?._id} onClick={createCommentHandler} size="small">
								<SendIcon sx={{ fontSize: 18 }} />
							</IconButton>
						</div>
					</div>

					<div className="mob-rpd-rev-list">
						<div className="mob-rpd-rev-list-header">
							<span className="mob-rpd-rev-title">{t('reviews')}</span>
							<span className="mob-rpd-rev-count">{commentTotal}</span>
						</div>

						{commentTotal === 0 ? (
							<div className="mob-rpd-rev-empty">
								<RateReviewIcon sx={{ fontSize: 32, color: '#ddd' }} />
								<p>{t('no_reviews_yet')}</p>
							</div>
						) : (
							<>
								{repairPropertyComments.map((comment: Comment) => {
									const { stars } = getRatingByMemberType(comment.memberData?.memberType ?? '');
									const avatarSrc = comment.memberData?.memberImage
										? (comment.memberData.memberImage.startsWith('http') ? comment.memberData.memberImage : `${REACT_APP_API_URL}/${comment.memberData.memberImage}`)
										: '/img/profile/defaultUser.svg';
									return (
										<div key={comment._id} className="mob-rpd-rev-card">
											<div className="mob-rpd-rev-top">
												<img src={avatarSrc} alt="" className="mob-rpd-rev-avatar" />
												<div className="mob-rpd-rev-user">
													<span className="mob-rpd-rev-name">{comment.memberData?.memberNick}</span>
													<span className="mob-rpd-rev-type">{t(comment.memberData?.memberType ?? '')}</span>
												</div>
												<div className="mob-rpd-rev-right">
													<span className="mob-rpd-rev-stars">{stars}</span>
													<span className="mob-rpd-rev-date">{dayjs(comment.createdAt).fromNow()}</span>
												</div>
											</div>
											<p className="mob-rpd-rev-text">{comment.commentContent}</p>
										</div>
									);
								})}
								<div className="mob-rpd-rev-pagination">
									<MuiPagination
										page={commentInquiry.page}
										count={Math.ceil(commentTotal / commentInquiry.limit)}
										onChange={commentPaginationChangeHandler}
										shape="circular" color="primary" size="small"
									/>
								</div>
							</>
						)}
					</div>
				</div>
			</div>
		);
	}

	return (
		<Stack className="repair-detail" direction="column" spacing={4}>
			<Stack className="back-link" onClick={() => router.push('/repairService')}>
				← {t('Back to property')}
			</Stack>
			<Stack className="repair-detail" direction={{ xs: 'column', md: 'row' }} spacing={3}>
				{/* Left - Image */}
				<Box component="div" className="repair-detail__image-box">
					<img src={`${REACT_APP_API_URL}/${slideImage}`} alt={t('Repair')} className="repair-detail__image" />
				</Box>

				{/* Right - Info */}
				<Stack className="repair-detail__info" spacing={2}>
					{/* Member */}
					<Stack direction="row" alignItems="center" spacing={2} className="repair-detail__member-box">
						<Avatar
							src={repairProperty?.memberData?.memberImage?.startsWith('http') ? `${repairProperty?.memberData?.memberImage}` : `${REACT_APP_API_URL}/${repairProperty?.memberData?.memberImage}`}
							alt={repairProperty?.memberData?.memberNick}
							className="repair-detail__member-avatar"
						/>
						<Typography className="repair-detail__member-nick">{repairProperty?.memberData?.memberNick}</Typography>
					</Stack>

					{/* Likes & Views */}
					<Stack
						direction="row"
						spacing={1.5}
						alignItems="center"
						justifyContent="flex-start"
						className="repair-detail__stats"
					>
						{/* Views */}
						<IconButton color="default" disableRipple>
							<RemoveRedEyeIcon />
						</IconButton>
						<Typography className="view-cnt">{repairProperty?.repairPropertyViews || 0}</Typography>

						{/* Likes */}
						{repairProperty?._id && (
							<IconButton
								color="default"
								onClick={(e) => {
									e.stopPropagation();
									likeRepairPropertyHandler(user, repairProperty._id);
								}}
							>
								{repairProperty.meLiked && repairProperty.meLiked[0]?.myFavorite ? (
									<FavoriteIcon style={{ color: 'red' }} />
								) : (
									<FavoriteIcon />
								)}
							</IconButton>
						)}

						<Typography className="view-cnt">{repairProperty?.repairPropertyLikes || 0}</Typography>
					</Stack>

					{/* Address */}
					<Stack direction="row" className="repair-detail__info-item">
						<LocationOnIcon fontSize="small" />
						<Typography className="repair-detail__address">{repairProperty?.repairPropertyAddress}</Typography>
					</Stack>

					<Stack direction="row" className="repair-detail__info-item">
						<PhoneIcon fontSize="small" />
						<Typography className="repair-detail__address">{repairProperty?.memberData?.memberPhone}</Typography>
					</Stack>

					<Stack direction="row" className="repair-detail__info-item">
						<DescriptionIcon fontSize="small" />
						<Typography className="repair-detail__desc">{repairProperty?.repairPropertyDescription}</Typography>
					</Stack>

					<Stack direction="row" className="repair-detail__info-item">
						<AccessTimeIcon fontSize="small" />
						<Typography className="repair-detail__created">
							{moment(repairProperty?.createdAt).format('YYYY-MM-DD HH:mm')}
						</Typography>
					</Stack>
				</Stack>
			</Stack>

			{/* Comments */}
			<Stack className="repair-detail__comments" spacing={3}>
				<Stack className="reviews-config">
					<Stack className="leave-review-config">
						<Stack direction="row" alignItems="center" spacing={1}>
							<RateReviewIcon sx={{ color: '#d89801' }} />
							<Typography className="main-title">{t('Write a Review')}</Typography>
						</Stack>

						<Typography className="review-title">{t('Review')}</Typography>

						<textarea
							onChange={({ target: { value } }) => {
								setInsertCommentData({ ...insertCommentData, commentContent: value });
							}}
							onKeyDown={(e) => {
								if (e.key === 'Enter' && !e.shiftKey) {
									e.preventDefault();
									if (insertCommentData.commentContent.trim() !== '' && user?._id) {
										createCommentHandler();
									}
								}
							}}
							value={insertCommentData.commentContent}
						></textarea>

						<Box className="submit-btn" component="div">
							<Button
								className="submit-review"
								disabled={insertCommentData.commentContent.trim() === '' || !user?._id}
								onClick={createCommentHandler}
							>
								<Typography className="title">{t('Submit Review')}</Typography>
							</Button>
						</Box>
					</Stack>

					{commentTotal !== 0 && (
						<>
							<Stack className="filter-box">
								<Stack className="review-cnt">
									<Typography className="reviews">{t('Review List')}</Typography>
									<Typography className="Show">
										{t('Showing 1-5 of {{total}} results', { total: commentTotal })}
									</Typography>
								</Stack>
							</Stack>

							<Stack className="review-list">
								{repairPropertyComments?.map((comment: Comment) => {
									const memberType = comment.memberData?.memberType;
									const { score, stars } = memberType
										? getRatingByMemberType(memberType)
										: { score: '-', stars: '☆☆☆☆☆' };

									return (
										<Stack className="single-review" key={comment._id} spacing={1}>
											<Review comment={comment} />
											<Typography className="review-stars" sx={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
												<span style={{ fontSize: '16px', color: '#d89801' }}>{stars}</span>
												<span style={{ fontSize: '13px', color: '#181a20' }}>{score}</span>
											</Typography>
											<Typography className="created-at" fontSize={12} color="text.secondary">
												{dayjs(comment.createdAt).fromNow()}
											</Typography>
										</Stack>
									);
								})}

								{repairPropertyComments.length !== 0 && (
									<Stack className="pagination-config">
										<Box component="div" className="pagination-box">
											<MuiPagination
												className="custom-pagination"
												page={commentInquiry.page}
												count={Math.ceil(commentTotal / commentInquiry.limit)}
												onChange={commentPaginationChangeHandler}
												shape="circular"
												color="primary"
											/>
										</Box>

										<Stack className="total-result">
											<Typography>
												{t('Total {{total}} review{{plural}}', {
													total: commentTotal,
													plural: commentTotal > 1 ? 's' : '',
												})}
											</Typography>
										</Stack>
									</Stack>
								)}
							</Stack>
						</>
					)}
				</Stack>
			</Stack>
		</Stack>
	);
};

RepairPropertyDetail.defaultProps = {
	initialComment: {
		page: 1,
		limit: 5,
		sort: 'createdAt',
		direction: 'DESC',
		search: {
			commentRefId: '',
		},
	},
};

export default withLayoutFull(RepairPropertyDetail);
