import React, { ChangeEvent, useEffect, useState } from 'react';
import { Box, Button, CircularProgress, Stack, Typography } from '@mui/material';
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
import { Direction, Message } from '../../libs/enums/common_enum';
import { RepairProperty } from '../../libs/types/repairProperty/repairProperty';
import Review from '../../libs/components/property/Review';

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

			await sweetTopSmallSuccessAlert('success', 800);
		} catch (err: any) {
			console.log('ERROR, likeRepairPropertyHandler', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const commentPaginationChangeHandler = async (event: ChangeEvent<unknown>, value: number) => {
		commentInquiry.page = value;
		setCommentInquiry({ ...commentInquiry });
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
			<Stack className="repair-detail__main" direction={{ xs: 'column', md: 'row' }} spacing={3}>
				{/* Left Image Card */}
				<Box component={'div'} className="repair-detail__image-box">
					<img src={`${REACT_APP_API_URL}/${slideImage}`} alt="Repair Image" className="repair-detail__image" />
				</Box>

				{/* Right Info Card */}
				<Stack className="repair-detail__info" spacing={2}>
					<Typography className="repair-detail__member">Member: {repairProperty?.memberData?.memberNick}</Typography>

					<Stack direction="row" spacing={2} alignItems="center">
						<FavoriteIcon fontSize="small" />
						<Typography>{repairProperty?.repairPropertyLikes || 0}</Typography>
						<RemoveRedEyeIcon fontSize="small" sx={{ marginLeft: 2 }} />
						<Typography>{repairProperty?.repairPropertyViews || 0}</Typography>
					</Stack>

					<Typography className="repair-detail__address">Address: {repairProperty?.repairPropertyAddress}</Typography>

					<Typography className="repair-detail__desc">{repairProperty?.repairPropertyDescription}</Typography>

					<Typography className="repair-detail__created">
						Created at: {moment(repairProperty?.createdAt).format('YYYY-MM-DD HH:mm')}
					</Typography>
				</Stack>
			</Stack>

			{/* Comments */}
			<Stack className="repair-detail__comments" spacing={3}>
				<Typography variant="h6">Comments</Typography>

				{commentTotal !== 0 && (
					<Stack className="reviews-config">
						<Stack className="filter-box">
							<Stack className="review-cnt">
								<Typography className="reviews">{commentTotal} reviews</Typography>
							</Stack>
						</Stack>

						<Stack className="review-list">
						{repairPropertyComments?.map((comment: Comment) => {
												return <Review comment={comment} key={comment?._id} />;
											})}

							<Box component="div" className="pagination-box">
								<MuiPagination
									count={Math.ceil(commentTotal / commentInquiry.limit)}
									page={commentInquiry.page}
									onChange={commentPaginationChangeHandler}
									shape="circular"
									color="primary"
								/>
							</Box>
						</Stack>
					</Stack>
				)}

				<Stack className="leave-review-config">
					<Typography className="main-title">Leave A Review</Typography>
					<Typography className="review-title">Review</Typography>
					<textarea
						onChange={({ target: { value } }) => {
							setInsertCommentData({ ...insertCommentData, commentContent: value });
						}}
						value={insertCommentData.commentContent}
					></textarea>
					<Box className="submit-btn" component="div">
						<Button 
							className="submit-review"
							disabled={insertCommentData.commentContent === '' || user?._id === ''}
							onClick={createCommentHandler}
						>
							<Typography className="title">Submit Review</Typography>
						</Button>
					</Box>
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
