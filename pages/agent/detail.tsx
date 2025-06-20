import React, { ChangeEvent, useEffect, useState } from 'react';
import { NextPage } from 'next';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import PropertyBigCard from '../../libs/components/common/PropertyBigCard';
import ReviewCard from '../../libs/components/agent/ReviewCard';
import { Box, Button, Pagination, Stack, Typography } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { useRouter } from 'next/router';
import { Property } from '../../libs/types/property/property';
import { Member } from '../../libs/types/member/member';
import { sweetErrorHandling, sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import { userVar } from '../../apollo/store';
import { PropertiesInquiry } from '../../libs/types/property/property.input';
import { CommentInput, CommentsInquiry } from '../../libs/types/comment/comment.input';
import { Comment } from '../../libs/types/comment/comment';
import { CommentGroup } from '../../libs/enums/comment.enum';
import { Messages, REACT_APP_API_URL } from '../../libs/config';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { CREATE_COMMENT, LIKE_TARGET_PROPERTY } from '../../apollo/user/mutation';
import { GET_COMMENTS, GET_MEMBER, GET_PROPERTIES } from '../../apollo/user/query';
import RateReviewIcon from '@mui/icons-material/RateReview';
import { T } from '../../libs/types/common';
import Review from '../../libs/components/property/Review';
import { Pagination as MuiPagination } from '@mui/material';
import relativeTime from 'dayjs/plugin/relativeTime';
import dayjs from 'dayjs';
import { useTranslation } from 'next-i18next';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const AgentDetail: NextPage = ({ initialInput, initialComment, ...props }: any) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const { t } = useTranslation('common');

	dayjs.extend(relativeTime);
	const [agentId, setAgentId] = useState<string | null>(null);
	const [agent, setAgent] = useState<Member | null>(null);
	const [searchFilter, setSearchFilter] = useState<PropertiesInquiry>(initialInput);
	const [agentProperties, setAgentProperties] = useState<Property[]>([]);
	const [propertyTotal, setPropertyTotal] = useState<number>(0);
	const [commentInquiry, setCommentInquiry] = useState<CommentsInquiry>(initialComment);
	const [agentComments, setAgentComments] = useState<Comment[]>([]);
	const [commentTotal, setCommentTotal] = useState<number>(0);
	const [insertCommentData, setInsertCommentData] = useState<CommentInput>({
		commentGroup: CommentGroup.MEMBER,
		commentContent: '',
		commentRefId: '',
	});

	/** APOLLO REQUESTS **/
	const [createComment] = useMutation(CREATE_COMMENT);
	const [likeTargetProperty] = useMutation(LIKE_TARGET_PROPERTY);

	const {
		loading: getMemberLoading,
		data: getMemberData,
		error: getMemberError,
		refetch: getMemberRefetch,
	} = useQuery(GET_MEMBER, {
		fetchPolicy: 'network-only',
		variables: { input: agentId },
		skip: !agentId,
		onCompleted: (data: T) => {
			setAgent(data?.getMember);
			setSearchFilter({
				...searchFilter,
				search: {
					memberId: data?.getMember?._id,
				},
			});
			setCommentInquiry({
				...commentInquiry,
				search: {
					commentRefId: data?.getMember?._id,
				},
			});
			setInsertCommentData({
				...insertCommentData,
				commentRefId: data?.getMember?._id,
			});
		},
	});

	const {
		loading: getPropertiesLoading,
		data: getPropertiesData,
		error: getPropertiesError,
		refetch: getPropertiesRefetch,
	} = useQuery(GET_PROPERTIES, {
		fetchPolicy: 'network-only',
		variables: { input: searchFilter },
		skip: !searchFilter.search.memberId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setAgentProperties(data?.getProperties?.list);
			setPropertyTotal(data?.getProperties?.metaCounter[0]?.total ?? 0);
		},
	});

	const {
		loading: getCommentsLoading,
		data: getCommentsData,
		error: getCommentsError,
		refetch: getCommentsRefetch,
	} = useQuery(GET_COMMENTS, {
		fetchPolicy: 'network-only',
		variables: { input: commentInquiry },
		skip: !commentInquiry.search.commentRefId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setAgentComments(data?.getComments?.list);
			setCommentTotal(data?.getComments?.metaCounter[0]?.total ?? 0);
		},
	});

	/** LIFECYCLES **/
	useEffect(() => {
		if (router.query.agentId) setAgentId(router.query.agentId as string);
	}, [router]);

	useEffect(() => {
		if (searchFilter.search.memberId) {
			getPropertiesRefetch({ variables: { input: searchFilter } }).then();
		}
	}, [searchFilter]);

	useEffect(() => {
		if (commentInquiry.search.commentRefId) {
			getCommentsRefetch({ variables: { input: commentInquiry } }).then();
		}
	}, [commentInquiry]);

	/** HANDLERS **/
	const redirectToMemberPageHandler = async (memberId: string) => {
		try {
			if (memberId === user?._id) await router.push(`/mypage?memberId=${memberId}`);
			else await router.push(`/member?memberId=${memberId}`);
		} catch (error) {
			await sweetErrorHandling(error);
		}
	};

	const propertyPaginationChangeHandler = async (event: ChangeEvent<unknown>, value: number) => {
		searchFilter.page = value;
		setSearchFilter({ ...searchFilter });
	};

	const commentPaginationChangeHandler = async (event: ChangeEvent<unknown>, value: number) => {
		commentInquiry.page = value;
		setCommentInquiry({ ...commentInquiry });
	};

	const createCommentHandler = async () => {
		try {
			if (!user._id) throw new Error(Messages.error2);
			if (user._id === agentId) throw new Error('Cannot write a review for yourself');

			await createComment({
				variables: {
					input: insertCommentData,
				},
			});
			setInsertCommentData({ ...insertCommentData, commentContent: '' });

			await getCommentsRefetch({ input: commentInquiry });
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	const likePropertyHandler = async (user: any, id: string) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Messages.error2);

			await likeTargetProperty({
				variables: {
					input: id,
				},
			});
			await getPropertiesRefetch({ input: searchFilter });
		} catch (err: any) {
			console.log('ERROR, likePropertyHandler:', err.message);
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

	if (device === 'mobile') {
		return <div>AGENT DETAIL PAGE MOBILE</div>;
	} else {
		return (
			<Stack className={'agent-detail-page'}>
				<Stack className={'container'}>
					<Stack className={'agent-info'}>
						<img
							src={agent?.memberImage ? `${REACT_APP_API_URL}/${agent?.memberImage}` : '/img/profile/defaultUser.svg'}
							alt=""
						/>
						<Box component={'div'} className={'info'} onClick={() => redirectToMemberPageHandler(agent?._id as string)}>
							<strong>{agent?.memberFullName ?? agent?.memberNick}</strong>
							<div>
								<img src="/img/icons/call.svg" alt="" />
								<span>{agent?.memberPhone}</span>
							</div>
						</Box>
					</Stack>
					<Stack className={'agent-home-list'}>
						<Stack className={'card-wrap'}>
							{agentProperties.map((property: Property) => {
								return (
									<div className={'wrap-main'} key={property?._id}>
										<PropertyBigCard
											property={property}
											likePropertyHandler={likePropertyHandler}
											key={property?._id}
										/>
									</div>
								);
							})}
						</Stack>
						<Stack className="pagination-config">
							{propertyTotal > 0 ? (
								<>
									<Stack className="pagination-box">
										<Pagination
											className="custom-pagination"
											page={searchFilter.page}
											count={Math.ceil(propertyTotal / searchFilter.limit) || 1}
											onChange={propertyPaginationChangeHandler}
											shape="circular"
											color="primary"
										/>
									</Stack>

									<Stack className="total-result">
										<Typography>
											{t('Total')} {propertyTotal} {t('propert')}
											{propertyTotal !== 1 ? t('ies') : t('y')} {t('available')}
										</Typography>
									</Stack>
								</>
							) : (
								<Stack className="no-data">
									<img src="/img/icons/icoAlert.svg" alt="No properties" />
									<Typography>{t('No properties found!')}</Typography>
								</Stack>
							)}
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
												{t('Showing')} 1-5 {t('of')} {commentTotal} {t('results')}
											</Typography>
										</Stack>
									</Stack>

									<Stack className="review-list">
										{agentComments?.map((comment: Comment) => {
											const memberType = comment.memberData?.memberType;
											const { score, stars } = memberType
												? getRatingByMemberType(memberType)
												: { score: '-', stars: '☆☆☆☆☆' };

											return (
												<Stack className="single-review" key={comment._id} spacing={1}>
													<Review comment={comment} />
													<Typography
														className="review-stars"
														sx={{ display: 'flex', alignItems: 'center', gap: '7px' }}
													>
														<span style={{ fontSize: '16px', color: '#d89801' }}>{stars}</span>
														<span style={{ fontSize: '13px', color: '#181a20' }}>{score}</span>
													</Typography>
													<Typography className="created-at" fontSize={12} color="text.secondary">
														{dayjs(comment.createdAt).fromNow()}
													</Typography>
												</Stack>
											);
										})}

										{agentComments.length !== 0 && (
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
														{t('Total')} {commentTotal} {t('review')}
														{commentTotal > 1 ? t('s') : ''}
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
			</Stack>
		);
	}
};

AgentDetail.defaultProps = {
	initialInput: {
		page: 1,
		limit: 6,
		search: {
			memberId: '',
		},
	},
	initialComment: {
		page: 1,
		limit: 5,
		sort: 'createdAt',
		direction: 'ASC',
		search: {
			commentRefId: '',
		},
	},
};

export default withLayoutBasic(AgentDetail);
