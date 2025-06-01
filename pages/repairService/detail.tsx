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
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DescriptionIcon from '@mui/icons-material/Description';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

SwiperCore.use([Autoplay, Navigation, Pagination]);

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const RepairPropertyDetail: NextPage = ({ initialComment, ...props }: any) => {
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

	console.log('repairPropertyId:', repairPropertyId, repairProperty?._id);
	console.log('slideImage:', getRepairPropertyData?.getRepairProperty?.repairPropertyImages?.[0], slideImage);

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
			if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);

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
			if (!user._id) throw Error(Message.NOT_AUTHENTICATED);
			await createRepairComment({ variables: { input: insertCommentData } });

			setInsertCommentData({ ...insertCommentData, commentContent: '' });

			await getCommentsRefetch({ input: commentInquiry });
		} catch (err) {
			await sweetErrorHandling(err);
		}
	};

	if (getRepairPropertiesLoading) {
		return (
			<Stack
				sx={{
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					width: '100%',
					height: '1800px',
				}}
			>
				<CircularProgress size={'4rem'} />
			</Stack>
		);
	}

	return (
		<Stack className="repair-detail" direction="column" spacing={4}>
			<Stack className="repair-detail" direction={{ xs: 'column', md: 'row' }} spacing={3}>
				{/* Left - Image */}
				<Box component="div" className="repair-detail__image-box">
					<img src={`${REACT_APP_API_URL}/${slideImage}`} alt="Repair" className="repair-detail__image" />
				</Box>

				{/* Right - Info */}
				<Stack className="repair-detail__info" spacing={2}>
					{/* Member */}
					<Stack direction="row" alignItems="center" spacing={2} className="repair-detail__member-box">
						<Avatar
							src={`${REACT_APP_API_URL}/${repairProperty?.memberData?.memberImage}`}
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
									likeRepairPropertyHandler(user, repairProperty._id); // endi string 100%
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
							<Typography className="main-title">Write a Review</Typography>
						</Stack>

						<Typography className="review-title">Review</Typography>

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
								<Typography className="title">Submit Review</Typography>
							</Button>
						</Box>
					</Stack>

					{commentTotal !== 0 && (
						<>
							<Stack className="filter-box">
								<Stack className="review-cnt">
									<Typography className="reviews">Review List</Typography>
									<Typography className="Show">Showing 1-5 of {commentTotal} results</Typography>
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
												Total {commentTotal} review{commentTotal > 1 ? 's' : ''}
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
