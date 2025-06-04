import React, { ChangeEvent, useEffect, useState } from 'react';
import { Box, Button, Chip, CircularProgress, IconButton, Rating, Stack, Tab, Tabs, Typography } from '@mui/material';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutFull from '../../libs/components/layout/LayoutFull';
import { NextPage } from 'next';
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore, { Autoplay, Navigation, Pagination } from 'swiper';
import PropertyBigCard from '../../libs/components/common/PropertyBigCard';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import WestIcon from '@mui/icons-material/West';
import EastIcon from '@mui/icons-material/East';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { useRouter } from 'next/router';
import { Property } from '../../libs/types/property/property';
import moment from 'moment';
import { formatterStr } from '../../libs/utils';
import { REACT_APP_API_URL } from '../../libs/config';
import { userVar } from '../../apollo/store';
import { CommentInput, CommentsInquiry } from '../../libs/types/comment/comment.input';
import { Comment } from '../../libs/types/comment/comment';
import { CommentGroup } from '../../libs/enums/comment.enum';
import { Pagination as MuiPagination } from '@mui/material';
import Link from 'next/link';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import 'swiper/css';
import 'swiper/css/pagination';
import { GET_COMMENTS, GET_PROPERTIES, GET_PROPERTY } from '../../apollo/user/query';
import { T } from '../../libs/types/common';
import { CREATE_COMMENT, LIKE_TARGET_PROPERTY } from '../../apollo/user/mutation';
import { sweetErrorHandling, sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import { create } from 'domain';
import { Direction, Message } from '../../libs/enums/common.enum';
import Review from '../../libs/components/property/Review';
import {
	Add,
	ChevronLeft,
	ChevronRight,
	Facebook,
	FavoriteBorder,
	Instagram,
	Pinterest,
	Remove,
	Twitter,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import RateReviewIcon from '@mui/icons-material/RateReview';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import TrendPropertyCard from '../../libs/components/homepage/TrendPropertyCard';

SwiperCore.use([Autoplay, Navigation, Pagination]);

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const PropertyDetail: NextPage = ({ initialComment, ...props }: any) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const user = useReactiveVar(userVar);
	dayjs.extend(relativeTime);
	const [propertyId, setPropertyId] = useState<string | null>(null);
	const [property, setProperty] = useState<Property | null>(null);
	const [slideImage, setSlideImage] = useState<string>('');
	const [destinationProperties, setDestinationProperties] = useState<Property[]>([]);
	const [commentInquiry, setCommentInquiry] = useState<CommentsInquiry>(initialComment);
	const [propertyComments, setPropertyComments] = useState<Comment[]>([]);
	const [commentTotal, setCommentTotal] = useState<number>(0);
	const [quantity, setQuantity] = useState(1);
	const [tabIndex, setTabIndex] = useState(0);
	const [insertCommentData, setInsertCommentData] = useState<CommentInput>({
		commentGroup: CommentGroup.PROPERTY,
		commentContent: '',
		commentRefId: '',
	});
	const images = property?.propertyImages ?? [];
	const currentIndex = images.indexOf(slideImage);

	/** APOLLO REQUESTS **/
	const [likeTargetProperty] = useMutation(LIKE_TARGET_PROPERTY);
	const [createComment] = useMutation(CREATE_COMMENT);

	const {
		loading: getPropertyLoading,
		data: getPropertyData,
		error: getPropertyError,
		refetch: getPropertyRefetch,
	} = useQuery(GET_PROPERTY, {
		fetchPolicy: 'network-only',
		variables: { input: propertyId },
		skip: !propertyId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			if (data?.getProperty) setProperty(data?.getProperty);
			if (data?.getProperty) setSlideImage(data?.getProperty?.propertyImages[0]);
		},
	});

	console.log('propertyId:', propertyId, property?._id);
	console.log('aaaaa', getPropertyData?.getProperty?.propertyImages[0], slideImage);

	const {
		loading: getPropertiesLoading,
		data: getPropertiesData,
		error: getPropertiesError,
		refetch: getPropertiesRefetch,
	} = useQuery(GET_PROPERTIES, {
		fetchPolicy: 'cache-and-network',
		variables: {
			input: {
				page: 1,
				limit: 4,
				sort: 'createdAt',
				direction: Direction.DESC,
				search: {
					locationList: property?.propertyCategory ? [property?.propertyCategory] : [],
				},
			},
		},
		skip: !propertyId && !property,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			if (data?.getProperties?.list) setDestinationProperties(data?.getProperties?.list);
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
			if (data?.getComments?.list) setPropertyComments(data?.getComments?.list);
			setCommentTotal(data?.getComments?.metaCounter[0]?.total ?? 0);
		},
	});
	/** LIFECYCLES **/
	useEffect(() => {
		if (router.query.id) {
			setPropertyId(router.query.id as string);
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

	const likePropertyHandler = async (user: T, id: string) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);
			//execute likePropertyHandler Mutation
			await likeTargetProperty({ variables: { input: id } });

			//execute getPropertiesRefetch
			await getPropertyRefetch({ input: id });
			await getPropertiesRefetch({
				input: {
					page: 1,
					limit: 4,
					sort: 'createdAt',
					direction: Direction.DESC,
					search: {
						categoryList: [property?.propertyCategory],
					},
				},
			});
		} catch (err: any) {
			console.log('ERROR, likePropertyHandler', err.message);
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

	const commentPaginationChangeHandler = async (event: ChangeEvent<unknown>, value: number) => {
		commentInquiry.page = value;
		setCommentInquiry({ ...commentInquiry });
	};

	const createCommentHandler = async () => {
		try {
			if (!user._id) throw Error(Message.NOT_AUTHENTICATED);
			await createComment({ variables: { input: insertCommentData } });

			setInsertCommentData({ ...insertCommentData, commentContent: '' });

			await getCommentsRefetch({ input: commentInquiry });
		} catch (err) {
			await sweetErrorHandling(err);
		}
	};

	const handleTabChange = (_: any, newIndex: number) => {
		setTabIndex(newIndex);
	};

	const handleQuantityChange = (change: number) => {
		setQuantity((prev) => Math.max(1, prev + change));
	};

	const prevImage = () => {
		if (currentIndex === -1) return;
		const prevIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
		setSlideImage(images[prevIndex]);
	};

	const nextImage = () => {
		if (currentIndex === -1) return;
		const nextIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1;
		setSlideImage(images[nextIndex]);
	};

	if (getPropertiesLoading) {
		return (
			<Stack sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '1800px' }}>
				<CircularProgress size={'4rem'} />
			</Stack>
		);
	}

	if (device === 'mobile') {
		return <div>PROPERTY DETAIL PAGE</div>;
	} else {
		return (
			<div id={'property-detail-page'}>
				<div className={'container'}>
					<Stack className={'property-detail-config'}>
						<Stack className="productContainer">
							<Stack className="back-link" onClick={() => router.push('/property')}>
								← Back to property
							</Stack>
							<Stack className="productGrid">
								<Stack className="imageSection">
									<Stack className="mainImageContainer" style={{ position: 'relative' }}>
										<IconButton onClick={prevImage} className="prev-button" aria-label="Previous image">
											<ArrowBackIosIcon fontSize="small" />
										</IconButton>

										<img
											src={slideImage ? `${REACT_APP_API_URL}/${slideImage}` : '/img/property/bigImage.png'}
											alt="main-image"
											className="mainImage"
										/>
										<IconButton onClick={nextImage} className="next-button" aria-label="Next image">
											<ArrowForwardIosIcon fontSize="small" />
										</IconButton>
									</Stack>

									<Stack className="thumbnailContainer">
										{images.map((subImg) => {
											const imagePath = `${REACT_APP_API_URL}/${subImg}`;
											return (
												<Stack
													className={`thumbnail ${slideImage === subImg ? 'active' : ''}`}
													onClick={() => changeImageHandler(subImg)}
													key={subImg}
												>
													<img src={imagePath} alt="sub-image" />
												</Stack>
											);
										})}
									</Stack>
								</Stack>

								<Stack className="productInfo">
									<Typography className="category">{property?.propertyCategory}</Typography>

									<Stack className="titleRow">
										<Typography variant="h4" className="title">
											{property?.propertyTitle}
										</Typography>
										<Chip
											label={property?.propertyInStock ? 'In Stock' : 'Out of Stock'}
											sx={{
												backgroundColor: property?.propertyInStock ? ' #d1fae5' : '#fbc1bf',
												color: property?.propertyInStock ? '#065f46' : '#9b0b0b',
												fontWeight: 600,
												px: 2,
												py: 0.5,
												borderRadius: '20px',
											}}
										/>
									</Stack>

									<Stack className="ratingRow">
										<Stack className="rating">
											<Rating readOnly size="small" value={4.9} precision={0.1} sx={{ color: '#ffc107' }} />
											<Typography variant="body2" sx={{ fontWeight: 500 }}>
												4.9
											</Typography>
										</Stack>
									</Stack>

									<Stack className="priceRow">
										<Typography className="currentPrice">
											${property?.propertySalePrice || property?.propertyPrice}
										</Typography>
										{property?.propertySalePrice && (
											<Typography className="originalPrice">${property?.propertyPrice}</Typography>
										)}
									</Stack>

									<Typography className="description">
										{property?.propertyDesc || 'No description provided.'}
									</Typography>

									<Stack className="colorSection" direction="row" alignItems="center" gap={1}>
										<Typography className="colorLabel">Color: {property?.propertyColor?.toLowerCase()}</Typography>

										{property?.propertyColor && (
											<Stack
												className="colorDot"
												sx={{
													width: '20px',
													height: '20px',
													borderRadius: '50%',
													backgroundColor: property.propertyColor.toLowerCase(),
													border: '1px solid #999',
												}}
											/>
										)}
									</Stack>

									<Stack className="quantityControl1">
										<Stack className="quantityControl" direction="row" alignItems="center" spacing={1}>
											<IconButton onClick={() => handleQuantityChange(-1)}>
												<Remove />
											</IconButton>
											<input
												type="number"
												value={quantity}
												onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
												className="quantityInput"
											/>
											<IconButton onClick={() => handleQuantityChange(1)}>
												<Add />
											</IconButton>
										</Stack>

										<Stack className="actionButtons">
											<Button className="addToCartBtn" variant="contained">
												Add To Cart
											</Button>
										</Stack>
									</Stack>

									<Stack className="buttons">
										<Stack className="button-box">
											<span className="metaLabel">Views :</span>
											<RemoveRedEyeIcon fontSize="medium" />
											<Typography>{property?.propertyViews}</Typography>
										</Stack>
										<Stack className="button-box" onClick={() => likePropertyHandler(user, property!._id)}>
											{property?.meLiked && property?.meLiked[0]?.myFavorite ? (
												<FavoriteIcon color="primary" fontSize="medium" />
											) : (
												<FavoriteBorderIcon fontSize="medium" />
											)}
											<Typography>{property?.propertyLikes}</Typography>
										</Stack>
									</Stack>

									<Stack className="productMeta">
										<Stack className="metaRow">
											<span className="metaLabel1">Tags :</span>
											<span className="metaValue">{property?.propertyType}</span>
										</Stack>

										<Stack className="metaRow">
											<span className="metaLabel">Material :</span>
											<span className="metaValue">{property?.propertyMaterial}</span>
										</Stack>

										<Stack className="shareRow">
											<span className="shareLabel">Share :</span>
											<Stack className="shareButtons">
												<IconButton size="small" className="facebook">
													<Facebook fontSize="small" />
												</IconButton>
												<IconButton size="small" className="twitter">
													<Twitter fontSize="small" />
												</IconButton>
												<IconButton size="small" className="pinterest">
													<Pinterest fontSize="small" />
												</IconButton>
												<IconButton size="small" className="instagram">
													<Instagram fontSize="small" />
												</IconButton>
											</Stack>
										</Stack>
									</Stack>
								</Stack>
							</Stack>
						</Stack>

						<Stack className={'property-desc-config'}>
							<Stack className="left-config">
								<Tabs value={tabIndex} onChange={handleTabChange} className="property-tabs">
									<Tab label="Description" />
									<Tab label={`Reviews (${commentTotal})`} />
								</Tabs>

								{tabIndex === 0 && (
									<Stack className="prop-desc-config">
										<Stack className="top-section">
											<Typography className="main-title">Property Description</Typography>
											<Typography className="description-text">
												{property?.propertyDesc ?? 'No Description!'}
											</Typography>
										</Stack>

										<Stack className="bottom-section" direction="row">
											<Stack className="details-container">
												{/* Features Section */}
												<Box component="div" className="details-section">
													<Box component="div" className="section-header">
														<Typography className="header-text">Features</Typography>
														<Typography className="header-text">Details</Typography>
													</Box>

													<Box component="div" className="detail-row">
														<span className="detail-label">Brand</span>
														<span className="detail-value">{property?.propertyTitle || 'N/A'}</span>
													</Box>

													<Box component="div" className="detail-row alternate">
														<span className="detail-label">Color</span>
														<span className="detail-value">{property?.propertyColor || 'N/A'}</span>
													</Box>

													<Box component="div" className="detail-row">
														<span className="detail-label">Product Dimensions</span>
														<span className="detail-value">
															{property?.propertySize ? `${property.propertySize} cm` : 'N/A'}
														</span>
													</Box>

													<Box component="div" className="detail-row alternate">
														<span className="detail-label">Size</span>
														<span className="detail-value">
															{property?.propertySize ? `${property.propertySize} cm` : 'N/A'}
														</span>
													</Box>

													<Box component="div" className="detail-row">
														<span className="detail-label">Material</span>
														<span className="detail-value">{property?.propertyMaterial || 'N/A'}</span>
													</Box>

													<Box component="div" className="detail-row alternate">
														<span className="detail-label">Style</span>
														<span className="detail-value">{property?.propertyType || 'Modern'}</span>
													</Box>

													<Box component="div" className="detail-row">
														<span className="detail-label">Unit Count</span>
														<span className="detail-value">1.0 Count</span>
													</Box>
												</Box>

												{/* Information Section */}
												<Box component="div" className="details-section">
													<Box component="div" className="section-header">
														<Typography className="header-text">Features</Typography>
														<Typography className="header-text">Information</Typography>
													</Box>

													<Box component="div" className="detail-row">
														<span className="detail-label">Category</span>
														<span className="detail-value">{property?.propertyCategory || 'N/A'}</span>
													</Box>

													<Box component="div" className="detail-row alternate">
														<span className="detail-label">Customer Reviews</span>
														<span className="detail-value"> </span>
														<Rating readOnly size="small" value={4.9} precision={0.1} sx={{ color: '#ffc107' }} />
													</Box>

													<Box component="div" className="detail-row">
														<span className="detail-label">Product Dimensions</span>
														<span className="detail-value">
															{property?.propertySize ? `${property.propertySize} cm` : 'N/A'}
														</span>
													</Box>

													<Box component="div" className="detail-row alternate">
														<span className="detail-label">Price</span>
														<span className="detail-value">${formatterStr(property?.propertyPrice)}</span>
													</Box>

													{property?.propertyIsOnSale && (
														<>
															<Box component="div" className="detail-row">
																<span className="detail-label">Sale Price</span>
																<span className="detail-value">${formatterStr(property?.propertySalePrice)}</span>
															</Box>

															<Box component="div" className="detail-row alternate">
																<span className="detail-label">Sale Ends</span>
																<span className="detail-value">
																	{moment(property?.propertySaleExpiresAt).format('DD MMM YYYY')}
																</span>
															</Box>
														</>
													)}

													<Box component="div" className="detail-row">
														<span className="detail-label">Condition</span>
														<span className="detail-value">{property?.propertyCondition || 'New'}</span>
													</Box>
												</Box>
											</Stack>
										</Stack>
									</Stack>
								)}

								{tabIndex === 1 && (
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

												<Box component="div" className="submit-btn">
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
														{propertyComments?.map((comment: any) => {
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
													</Stack>
												</>
											)}
										</Stack>
									</Stack>
								)}
							</Stack>

							<Stack className={'right-config'}>
								<Stack className={'info-box'}>
									<Typography className={'main-title'}>Get More Information</Typography>
									<Stack className={'image-info'}>
										<img
											className={'member-image'}
											src={
												property?.memberData?.memberImage
													? `${REACT_APP_API_URL}/${property?.memberData?.memberImage}`
													: '/img/profile/defaultUser.svg'
											}
										/>
										<Stack className={'name-phone-listings'}>
											<Link href={`/member?memberId=${property?.memberData?._id}`}>
												<Typography className={'name'}>{property?.memberData?.memberNick}</Typography>
											</Link>

											<Stack className={'phone-number'}>
												<svg xmlns="http://www.w3.org/2000/svg" width="17" height="16" viewBox="0 0 17 16" fill="none">
													<g clipPath="url(#clip0_6507_6774)">
														<path
															d="M16.2858 10.11L14.8658 8.69C14.5607 8.39872 14.1551 8.23619 13.7333 8.23619C13.3115 8.23619 12.9059 8.39872 12.6008 8.69L12.1008 9.19C11.7616 9.528 11.3022 9.71778 10.8233 9.71778C10.3444 9.71778 9.88506 9.528 9.54582 9.19C9.16082 8.805 8.91582 8.545 8.67082 8.29C8.42582 8.035 8.17082 7.76 7.77082 7.365C7.43312 7.02661 7.24347 6.56807 7.24347 6.09C7.24347 5.61193 7.43312 5.15339 7.77082 4.815L8.27082 4.315C8.41992 4.16703 8.53822 3.99099 8.61889 3.79703C8.69956 3.60308 8.741 3.39506 8.74082 3.185C8.739 2.76115 8.57012 2.35512 8.27082 2.055L6.85082 0.625C6.44967 0.225577 5.9069 0.000919443 5.34082 0C5.06197 0.000410905 4.78595 0.0558271 4.52855 0.163075C4.27116 0.270322 4.03745 0.427294 3.84082 0.625L2.48582 1.97C1.50938 2.94779 0.960937 4.27315 0.960938 5.655C0.960937 7.03685 1.50938 8.36221 2.48582 9.34C3.26582 10.12 4.15582 11 5.04082 11.92C5.92582 12.84 6.79582 13.7 7.57082 14.5C8.5484 15.4749 9.87269 16.0224 11.2533 16.0224C12.6339 16.0224 13.9582 15.4749 14.9358 14.5L16.2858 13.15C16.6828 12.7513 16.9073 12.2126 16.9108 11.65C16.9157 11.3644 16.8629 11.0808 16.7555 10.8162C16.6481 10.5516 16.4884 10.3114 16.2858 10.11ZM15.5308 12.375L15.3858 12.5L13.9358 11.045C13.8875 10.99 13.8285 10.9455 13.7623 10.9142C13.6961 10.8829 13.6243 10.8655 13.5511 10.8632C13.478 10.8608 13.4051 10.8734 13.337 10.9003C13.269 10.9272 13.2071 10.9678 13.1554 11.0196C13.1036 11.0713 13.0631 11.1332 13.0361 11.2012C13.0092 11.2693 12.9966 11.3421 12.999 11.4153C13.0014 11.4884 13.0187 11.5603 13.05 11.6265C13.0813 11.6927 13.1258 11.7517 13.1808 11.8L14.6558 13.275L14.2058 13.725C13.4279 14.5005 12.3743 14.936 11.2758 14.936C10.1774 14.936 9.12372 14.5005 8.34582 13.725C7.57582 12.955 6.70082 12.065 5.84582 11.175C4.99082 10.285 4.06582 9.37 3.28582 8.59C2.51028 7.81209 2.0748 6.75845 2.0748 5.66C2.0748 4.56155 2.51028 3.50791 3.28582 2.73L3.73582 2.28L5.16082 3.75C5.26027 3.85277 5.39648 3.91182 5.53948 3.91417C5.68247 3.91651 5.82054 3.86196 5.92332 3.7625C6.02609 3.66304 6.08514 3.52684 6.08748 3.38384C6.08983 3.24084 6.03527 3.10277 5.93582 3L4.43582 1.5L4.58082 1.355C4.67935 1.25487 4.79689 1.17543 4.92654 1.12134C5.05619 1.06725 5.19534 1.03959 5.33582 1.04C5.61927 1.04085 5.89081 1.15414 6.09082 1.355L7.51582 2.8C7.61472 2.8998 7.6704 3.0345 7.67082 3.175C7.67088 3.24462 7.65722 3.31358 7.63062 3.37792C7.60403 3.44226 7.56502 3.50074 7.51582 3.55L7.01582 4.05C6.47844 4.58893 6.17668 5.31894 6.17668 6.08C6.17668 6.84106 6.47844 7.57107 7.01582 8.11C7.43582 8.5 7.66582 8.745 7.93582 9C8.20582 9.255 8.43582 9.53 8.83082 9.92C9.36974 10.4574 10.0998 10.7591 10.8608 10.7591C11.6219 10.7591 12.3519 10.4574 12.8908 9.92L13.3908 9.42C13.4929 9.32366 13.628 9.26999 13.7683 9.26999C13.9087 9.26999 14.0437 9.32366 14.1458 9.42L15.5658 10.84C15.6657 10.9387 15.745 11.0563 15.7991 11.1859C15.8532 11.3155 15.8809 11.4546 15.8808 11.595C15.8782 11.7412 15.8459 11.8853 15.7857 12.0186C15.7255 12.1518 15.6388 12.2714 15.5308 12.37V12.375Z"
															fill="#181A20"
														/>
													</g>
													<defs>
														<clipPath id="clip0_6507_6774">
															<rect width="16" height="16" fill="white" transform="translate(0.9375)" />
														</clipPath>
													</defs>
												</svg>
												<Typography className={'number'}>{property?.memberData?.memberPhone}</Typography>
											</Stack>
											<Typography className={'listings'}>View Listings</Typography>
										</Stack>
									</Stack>
								</Stack>

								<Stack className={'info-box'}>
									<Typography className={'sub-title'}>Name</Typography>
									<input type={'text'} placeholder={'Enter your name'} />
								</Stack>

								<Stack className={'info-box'}>
									<Typography className={'sub-title'}>Phone</Typography>
									<input type={'text'} placeholder={'Enter your phone'} />
								</Stack>

								<Stack className={'info-box'}>
									<Typography className={'sub-title'}>Message</Typography>
									<textarea placeholder={'Hello, I am interested in \n' + '[Renovated property at floor]'}></textarea>
								</Stack>

								<Stack className={'info-box'}>
									<Button className={'send-message'}>
										<Typography className={'title'}>Send Message</Typography>
									</Button>
								</Stack>
							</Stack>
						</Stack>

						{destinationProperties.length !== 0 && (
                <Stack className="similar-properties-config">
                  <Stack className="header-row">
                    <Stack className="title-box">
                      <Typography className="main-title">Similar Timepieces</Typography>
                      <Typography className="sub-title">You may also be interested in</Typography>
                    </Stack>
                  </Stack>

                  <div className="swiper-arrows">
                    <WestIcon className="swiper-prev" />
                    <EastIcon className="swiper-next" />
                  </div>

                  <div className="swiper-container">
                    <Swiper
                      slidesPerView="auto"
                      spaceBetween={35}
                      navigation={{
                        nextEl: '.swiper-next',
                        prevEl: '.swiper-prev',
                      }}
                      modules={[Navigation]}
                    >
                      {destinationProperties.map((property: Property) => {
                        return (
                          <SwiperSlide key={property.propertyCategory}>
                            <PropertyBigCard
                              property={property}
                              likePropertyHandler={likePropertyHandler}
                              key={property?._id}
                            />
                          </SwiperSlide>
                        );
                      })}
                    </Swiper>
                  </div>
                </Stack>
              )}
					</Stack>
				</div>
			</div>
		);
	}
};

PropertyDetail.defaultProps = {
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

export default withLayoutFull(PropertyDetail);
