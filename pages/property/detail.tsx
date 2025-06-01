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
							<Stack className={'similar-properties-config'}>
								<Stack className={'title-pagination-box'}>
									<Stack className={'title-box'}>
										<Typography className={'main-title'}>Destination Property</Typography>
										<Typography className={'sub-title'}>Aliquam lacinia diam quis lacus euismod</Typography>
									</Stack>
									<Stack className={'pagination-box'}>
										<WestIcon className={'swiper-similar-prev'} />
										<div className={'swiper-similar-pagination'}></div>
										<EastIcon className={'swiper-similar-next'} />
									</Stack>
								</Stack>
								<Stack className={'cards-box'}>
									<Swiper
										className={'similar-homes-swiper'}
										slidesPerView={'auto'}
										spaceBetween={35}
										modules={[Autoplay, Navigation, Pagination]}
										navigation={{
											nextEl: '.swiper-similar-next',
											prevEl: '.swiper-similar-prev',
										}}
										pagination={{
											el: '.swiper-similar-pagination',
										}}
									>
										{destinationProperties.map((property: Property) => {
											return (
												<SwiperSlide className={'similar-homes-slide'} key={property._id}>
													<PropertyBigCard
														property={property}
														likePropertyHandler={likePropertyHandler}
														key={property?._id}
													/>
												</SwiperSlide>
											);
										})}
									</Swiper>
								</Stack>
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
