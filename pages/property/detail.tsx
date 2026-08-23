import React, { ChangeEvent, useEffect, useState } from 'react';
import { Box, Button, Chip, CircularProgress, IconButton, Rating, Stack, Tab, Tabs, Typography } from '@mui/material';
import Loading from '../../libs/components/common/Loading';
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
import { formatterStr, formatCount } from '../../libs/utils';
import { REACT_APP_API_URL } from '../../libs/config';
import { userVar } from '../../apollo/store';
import { addToCart } from '../../libs/utils/cartUtils';
import { flyToCart } from '../../libs/utils/flyToCart';
import Link from 'next/link';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import 'swiper/css';
import 'swiper/css/pagination';
import { GET_PROPERTIES, GET_PROPERTY, GET_PROPERTY_REVIEW_SUMMARY } from '../../apollo/user/query';
import { T } from '../../libs/types/common';
import { CREATE_REVIEW, LIKE_TARGET_PROPERTY, SEND_MESSAGE } from '../../apollo/user/mutation';
import { sweetErrorHandling, sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import { create } from 'domain';
import { Direction, Message } from '../../libs/enums/common.enum';
import ReviewSection from '../../libs/components/property/ReviewSection';
import SEO from '../../libs/components/common/SEO';
import { Add, ChevronLeft, ChevronRight, FavoriteBorder, Remove, Share } from '@mui/icons-material';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import SendIcon from '@mui/icons-material/Send';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import TrendPropertyCard from '../../libs/components/homepage/TrendPropertyCard';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import { useTranslation } from 'next-i18next';
import { getLocalizedTitle, getLocalizedDesc } from '../../libs/utils/localizeProperty';
import { useCurrency } from '../../libs/context/CurrencyContext';
import ShareModal from '../../libs/components/property/ShareModal';
import ArLaunchButton from '../../libs/components/ar/ArLaunchButton';

SwiperCore.use([Autoplay, Navigation, Pagination]);

export const getServerSideProps = async ({ locale, query }: any) => {
	const translations = await serverSideTranslations(locale, ['common']);
	let seoProperty = null;

	const id = query?.id;
	if (id) {
		try {
			const res = await fetch(process.env.REACT_APP_API_GRAPHQL_URL as string, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					query: `query($propertyId: String!) {
						getProperty(propertyId: $propertyId) {
							propertyTitle propertyImages propertyDesc
							propertyPrice propertySalePrice propertyRating propertyReviews propertyInStock
						}
					}`,
					variables: { propertyId: id },
				}),
			});
			const json = await res.json();
			if (json?.data?.getProperty) seoProperty = json.data.getProperty;
		} catch {
			/* SEO is best-effort; page still renders */
		}
	}

	return { props: { ...translations, seoProperty } };
};

const PropertyDetail: NextPage = (props: any) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const user = useReactiveVar(userVar);
	dayjs.extend(relativeTime);
	const [propertyId, setPropertyId] = useState<string | null>(null);
	const [property, setProperty] = useState<Property | null>(null);
	const [slideImage, setSlideImage] = useState<string>('');
	const [destinationProperties, setDestinationProperties] = useState<Property[]>([]);
	const [quantity, setQuantity] = useState(1);
	const [tabIndex, setTabIndex] = useState(0);
	const { t } = useTranslation('common');
	const { formatPrice } = useCurrency();
	const localizedTitle = getLocalizedTitle(property, router.locale);
	const localizedDesc = getLocalizedDesc(property, router.locale);
	// Zoom state
	const [isZoomed, setIsZoomed] = useState<boolean>(false);
	const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

	const images = property?.propertyImages ?? [];
	const currentIndex = images.indexOf(slideImage);

	// Contact agent form
	const [contactName, setContactName] = useState('');
	const [contactPhone, setContactPhone] = useState('');
	const [contactMessage, setContactMessage] = useState('');
	const [sendingMessage, setSendingMessage] = useState(false);

	/** APOLLO REQUESTS **/
	const [likeTargetProperty] = useMutation(LIKE_TARGET_PROPERTY);
	const [sendMessage] = useMutation(SEND_MESSAGE);

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
			if (data?.getProperty?.propertyImages?.[0]) setSlideImage(data?.getProperty?.propertyImages?.[0]);
		},
	});

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
					categoryList: property?.propertyCategory ? [property?.propertyCategory] : [],
				},
			},
		},
		skip: !propertyId && !property,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			if (data?.getProperties?.list) setDestinationProperties(data?.getProperties?.list);
		},
	});

	const { data: reviewSummaryData } = useQuery(GET_PROPERTY_REVIEW_SUMMARY, {
		variables: { propertyId: propertyId as string },
		skip: !propertyId,
		fetchPolicy: 'cache-and-network',
	});
	const reviewTotal: number = reviewSummaryData?.getPropertyReviewSummary?.totalReviews ?? property?.propertyReviews ?? 0;

	/** LIFECYCLES **/
	useEffect(() => {
		if (router.query.id) {
			setProperty(null);
			setSlideImage('');
			setPropertyId(router.query.id as string);
		}
	}, [router]);

	useEffect(() => {
		if (user?._id) {
			setContactName((prev) => prev || user.memberNick || '');
			setContactPhone((prev) => prev || user.memberPhone || '');
		}
	}, [user?._id]);

	/** HANDLERS **/
	const changeImageHandler = (image: string) => {
		setSlideImage(image);
	};

	// Zoom handlers
	const handleMouseEnter = (): void => {
		setIsZoomed(true);
	};

	const handleMouseLeave = (): void => {
		setIsZoomed(false);
	};

	const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>): void => {
		const rect = e.currentTarget.getBoundingClientRect();
		const x = ((e.clientX - rect.left) / rect.width) * 100;
		const y = ((e.clientY - rect.top) / rect.height) * 100;
		setMousePosition({ x, y });
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
			console.error('ERROR, likePropertyHandler', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const sendMessageHandler = async () => {
		try {
			if (!user?._id) throw new Error(Message.NOT_AUTHENTICATED);
			if (!property?._id) return;
			if (!contactMessage.trim()) {
				await sweetMixinErrorAlert(t('Please write a message'));
				return;
			}
			setSendingMessage(true);
			await sendMessage({
				variables: {
					input: {
						propertyId: property._id,
						message: contactMessage,
						name: contactName || undefined,
						phone: contactPhone || undefined,
					},
				},
			});
			setContactMessage('');
			sweetTopSmallSuccessAlert(t('Message sent to the seller!'), 2000);
		} catch (err) {
			await sweetErrorHandling(err);
		} finally {
			setSendingMessage(false);
		}
	};

	/** SHARE **/
	const [shareOpen, setShareOpen] = useState(false);
	const getShareUrl = () => `https://zinfurn.uz/property/detail?id=${property?._id}`;
	const getShareText = () => `${localizedTitle} — Zinfurn`;

	const handleTabChange = (_: any, newIndex: number) => {
		setTabIndex(newIndex);
	};

	const handleQuantityChange = (change: number) => {
		setQuantity((prev) => Math.max(1, prev + change));
	};

	// propertyInStock aniq `false` bo'lsagina tugagan deb hisoblanadi (undefined = ma'lumot yo'q)
	const isOutOfStock = property?.propertyInStock === false;

	const handleAddToCart = (e: React.MouseEvent) => {
		if (!property || isOutOfStock) return;
		addToCart(
			{
				_id: property._id,
				propertyTitle: localizedTitle,
				propertyPrice: property.propertyPrice,
				propertySalePrice: property.propertySalePrice,
				propertyImages: property.propertyImages,
				propertyType: property.propertyType,
			},
			quantity,
		);
		const imgSrc = property.propertyImages?.[0]
			? `${REACT_APP_API_URL}/${property.propertyImages[0]}`
			: '/img/banner/header1.svg';
		flyToCart(e.currentTarget as HTMLElement, imgSrc);
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

	const isPropertyReady = !!property && property._id === propertyId;

	// SEO source: client-loaded property when ready, otherwise server-fetched data (SSR) for link previews
	const seoSrc: any = (isPropertyReady ? property : null) || props.seoProperty;
	const seoId = (router.query?.id as string) || property?._id || '';
	const seoImage = seoSrc?.propertyImages?.[0] ? `${REACT_APP_API_URL}/${seoSrc.propertyImages[0]}` : undefined;
	const seoDesc = seoSrc?.propertyDesc
		? seoSrc.propertyDesc.slice(0, 160)
		: `${seoSrc?.propertyTitle || 'Furniture'} — buy at Zinfurn. ${seoSrc?.propertyReviews || 0} reviews, rated ${seoSrc?.propertyRating || 0}/5.`;
	const seoEl = seoSrc ? (
		<SEO
			title={seoSrc.propertyTitle}
			description={seoDesc}
			image={seoImage}
			url={`https://zinfurn.uz/property/detail?id=${seoId}`}
			type="product"
			price={seoSrc.propertySalePrice || seoSrc.propertyPrice}
			jsonLd={{
				'@context': 'https://schema.org',
				'@type': 'Product',
				name: seoSrc.propertyTitle,
				image: seoImage,
				description: seoDesc,
				offers: {
					'@type': 'Offer',
					price: seoSrc.propertySalePrice || seoSrc.propertyPrice,
					priceCurrency: 'KRW',
					availability: seoSrc.propertyInStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
				},
				aggregateRating: seoSrc.propertyReviews
					? { '@type': 'AggregateRating', ratingValue: seoSrc.propertyRating || 0, reviewCount: seoSrc.propertyReviews }
					: undefined,
			}}
		/>
	) : null;

	if (!isPropertyReady || getPropertiesLoading) {
		return (
			<>
				{seoEl}
				<Loading fullScreen={device === 'mobile'} />
			</>
		);
	}

	if (device === 'mobile') {
		return (
			<div id="mob-property-detail-page">
				{seoEl}
				{/* Back */}
				<div className="mob-det-back" onClick={() => router.push('/property')}>
					{t('back_to_property')}
				</div>

				{/* Asosiy rasm */}
				<div className="mob-det-img-wrap">
					<div className="mob-det-img-actions">
						<button type="button" className="mob-det-img-btn" onClick={() => setShareOpen(true)} aria-label={t('share')}>
							<Share sx={{ fontSize: 17 }} />
						</button>
						<button type="button" className="mob-det-img-btn" onClick={() => likePropertyHandler(user, property!._id)} aria-label={t('like')}>
							{property?.meLiked?.[0]?.myFavorite
								? <FavoriteIcon sx={{ fontSize: 18, color: 'var(--primary)' }} />
								: <FavoriteBorderIcon sx={{ fontSize: 18 }} />}
						</button>
					</div>
					<IconButton className="mob-det-prev" onClick={prevImage}><ArrowBackIosIcon fontSize="small" /></IconButton>
					<img
						src={slideImage ? `${REACT_APP_API_URL}/${slideImage}` : '/img/property/bigImage.png'}
						alt={localizedTitle || ''}
						className="mob-det-main-img" loading="lazy" decoding="async" />
					<IconButton className="mob-det-next" onClick={nextImage}><ArrowForwardIosIcon fontSize="small" /></IconButton>
				</div>

				{/* Thumbnaillar */}
				<div className="mob-det-thumbs">
					{images.map((subImg: string) => (
						<div
							key={subImg}
							className={`mob-det-thumb ${slideImage === subImg ? 'active' : ''}`}
							onClick={() => changeImageHandler(subImg)}
						>
							<img src={`${REACT_APP_API_URL}/${subImg}`} alt="" loading="lazy" decoding="async" />
						</div>
					))}
				</div>

				{/* Mahsulot ma'lumotlari */}
				<div className="mob-det-info">

					{/* Kategoriya + Stock badge */}
					<div className="mob-det-top-row">
						<span className="mob-det-cat">{t(property?.propertyCategory || '')}</span>
						<span className={`mob-det-stock ${property?.propertyInStock ? 'in' : 'out'}`}>
							{property?.propertyInStock ? t('in_stock') : t('out_of_stock')}
						</span>
					</div>

					{/* Sarlavha */}
					<h2 className="mob-det-title">{localizedTitle}</h2>

					{/* Reyting + sotilgan */}
					<div className="mob-det-rating">
						<Rating readOnly size="small" value={property?.propertyRating || 0} precision={0.1}
							sx={{ color: 'var(--star)', '& .MuiRating-iconEmpty': { color: '#e0e0e0' } }} />
						<span className="mob-det-rating-val">{property?.propertyRating ? property.propertyRating.toFixed(1) : '0.0'}</span>
						{property?.propertyReviews ? (
							<>
								<span className="mob-det-rating-dot">·</span>
								<span className="mob-det-reviews-count">({property.propertyReviews} {t('reviews')})</span>
							</>
						) : null}
						{property?.propertySoldCount ? (
							<>
								<span className="mob-det-rating-dot">·</span>
								<span className="mob-det-sold">{formatCount(property.propertySoldCount)}+ {t('sold')}</span>
							</>
						) : null}
					</div>

					{/* Narx */}
					<div className="mob-det-price">
						<span className="mob-det-cur-price">
							{formatPrice(property?.propertySalePrice || property?.propertyPrice)}
						</span>
						{property?.propertySalePrice && (
							<span className="mob-det-old-price">{formatPrice(property?.propertyPrice)}</span>
						)}
						{property?.propertySalePrice && (
							<span className="mob-det-sale-badge">
								-{Math.round(((property.propertyPrice - property.propertySalePrice) / property.propertyPrice) * 100)}%
							</span>
						)}
					</div>

					{/* Qisqa tavsif */}
					<p className="mob-det-desc">{localizedDesc || t('no_description_provided')}</p>

					<div className="mob-det-divider" />

					{/* Rang */}
					<div className="mob-det-color-row">
						<span className="mob-det-color-label">{t('color')}:</span>
						<span className="mob-det-color-dot" style={{ backgroundColor: property?.propertyColor?.toLowerCase() || '#ccc' }} />
						<span className="mob-det-color-name">{t(property?.propertyColor || '')}</span>
					</div>

					{/* Miqdor + Savatchaga */}
					<div className="mob-det-qty-row">
						<div className="mob-det-qty">
							<IconButton size="small" onClick={() => handleQuantityChange(-1)}><Remove fontSize="small" /></IconButton>
							<input type="number" value={quantity}
								onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
								className="mob-det-qty-input" />
							<IconButton size="small" onClick={() => handleQuantityChange(1)}><Add fontSize="small" /></IconButton>
						</div>
						<Button variant="contained" className="mob-det-cart-btn" onClick={handleAddToCart} disabled={isOutOfStock}>
							{t('add_to_cart')}
						</Button>
					</div>

					<div className="mob-det-ar">
					<ArLaunchButton
						modelUrl={
							property.propertyArModel ? `${REACT_APP_API_URL}/${property.propertyArModel}` : undefined
						}
						title={localizedTitle}
						category={property.propertyCategory}
						posterUrl={
							property.propertyImages?.[0] ? `${REACT_APP_API_URL}/${property.propertyImages[0]}` : undefined
						}
					/>
					</div>

					<div className="mob-det-divider" />

					{/* Meta */}
					<div className="mob-det-meta">
						<div className="mob-det-meta-row">
							<span className="mob-det-meta-label">{t('tags')}</span>
							<span className="mob-det-meta-val">{t(property?.propertyType || '')}</span>
						</div>
						<div className="mob-det-meta-row">
							<span className="mob-det-meta-label">{t('material')}</span>
							<span className="mob-det-meta-val">{t(property?.propertyMaterial || '')}</span>
						</div>
					</div>
				</div>

				{/* Tabs: Description / Reviews */}
				<div className="mob-det-tabs-section">
					<Tabs value={tabIndex} onChange={handleTabChange} className="mob-det-tabs">
						<Tab label={t('description')} />
						<Tab label={`${t('reviews')} (${reviewTotal})`} />
					</Tabs>

					{tabIndex === 0 && (
						<div className="mob-det-desc-tab">
							<div className="mob-det-table">
								<div className="mob-det-table-header">
									<span>{t('features')}</span><span>{t('details')}</span>
								</div>
								{[
									[t('brand'), localizedTitle],
									[t('color'), property?.propertyColor],
									[t('size'), property?.propertySize ? `${property.propertySize} ${t('cm')}` : null],
									[t('material'), property?.propertyMaterial],
									[t('style'), property?.propertyType],
								].map(([label, value], i) => (
									<div key={i} className={`mob-det-table-row ${i % 2 === 1 ? 'alt' : ''}`}>
										<span className="mob-det-table-label">{label}</span>
										<span className="mob-det-table-val">{value || t('not_available')}</span>
									</div>
								))}
							</div>

							<div className="mob-det-table" style={{ marginTop: 12 }}>
								<div className="mob-det-table-header">
									<span>{t('features')}</span><span>{t('information')}</span>
								</div>
								{[
									[t('category'), t(property?.propertyCategory || '')],
									[t('price'), `${formatPrice(property?.propertyPrice)}`],
									[t('condition'), property?.propertyCondition],
								].map(([label, value], i) => (
									<div key={i} className={`mob-det-table-row ${i % 2 === 1 ? 'alt' : ''}`}>
										<span className="mob-det-table-label">{label}</span>
										<span className="mob-det-table-val">{value || t('not_available')}</span>
									</div>
								))}
							</div>
						</div>
					)}

					{tabIndex === 1 && (
						<div className="mob-rev-tab">
							{/* Reyting va sharhlar — faqat sotib olgan mijoz qoldiradi */}
							{property?._id && <ReviewSection propertyId={property._id} />}
						</div>
					)}
				</div>

				{/* Get More Information */}
				<div className="mob-det-contact">
					<p className="mob-det-contact-title">{t('get_more_information')}</p>
					<div className="mob-det-agent-row">
						<img
							className="mob-det-agent-img"
							src={property?.memberData?.memberImage
								? (property.memberData.memberImage.startsWith('http') ? property.memberData.memberImage : `${REACT_APP_API_URL}/${property.memberData.memberImage}`)
								: '/img/profile/defaultUser.svg'}
							alt="" loading="lazy" decoding="async" />
						<div className="mob-det-agent-info">
							<Link href={`/member?memberId=${property?.memberData?._id}`}>
								<span className="mob-det-agent-name">{property?.memberData?.memberNick}</span>
							</Link>
							<span className="mob-det-agent-phone">{property?.memberData?.memberPhone}</span>
						</div>
					</div>
					<input className="mob-det-input" type="text" placeholder={t('enter_your_name')} value={contactName} onChange={(e) => setContactName(e.target.value)} />
					<input className="mob-det-input" type="text" placeholder={t('enter_your_phone')} value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
					<textarea className="mob-det-textarea" placeholder={t('message_placeholder')} value={contactMessage} onChange={(e) => setContactMessage(e.target.value)} />
					<button className="mob-det-send-btn" onClick={sendMessageHandler} disabled={sendingMessage}>{sendingMessage ? t('Sending...') : t('send_message')}</button>
				</div>

				{/* O'xshash mahsulotlar */}
				{destinationProperties.length !== 0 && (
					<div className="mob-det-similar">
						<div className="mob-det-similar-header">
							<div>
								<p className="mob-det-similar-title">{t('destination_furniture')}</p>
								<p className="mob-det-similar-sub">{t('comfort_style_durability')}</p>
							</div>
							<div className="mob-det-similar-nav">
								<button className="swiper-mob-similar-prev"><WestIcon sx={{ fontSize: 16 }} /></button>
								<button className="swiper-mob-similar-next"><EastIcon sx={{ fontSize: 16 }} /></button>
							</div>
						</div>
						<Swiper
							className="mob-det-swiper"
							slidesPerView="auto"
							spaceBetween={12}
							modules={[Autoplay, Navigation]}
							navigation={{ nextEl: '.swiper-mob-similar-next', prevEl: '.swiper-mob-similar-prev' }}
						>
							{destinationProperties.map((property: Property) => (
								<SwiperSlide style={{ width: '152px', height: '210px' }} key={property._id}>
									<PropertyBigCard property={property} likePropertyHandler={likePropertyHandler} key={property._id} />
								</SwiperSlide>
							))}
						</Swiper>
					</div>
				)}
				<ShareModal open={shareOpen} onClose={() => setShareOpen(false)} url={getShareUrl()} title={localizedTitle || 'Zinfurn'} text={getShareText()} />
			</div>
		);
	} else {
		return (
			<div id={'property-detail-page'}>
				{seoEl}
				<div className={'container'}>
					<Stack className={'property-detail-config'}>
						<Stack className="productContainer">
							<Stack className="back-link" onClick={() => router.push('/property')}>
								{t('back_to_property')}
							</Stack>
							<Stack className="productGrid">
								<Stack className="imageSection">
									<Stack className="mainImageContainer">
										<Stack className="imageActions">
											<button type="button" className="imageActionBtn" onClick={() => setShareOpen(true)} aria-label={t('share')}>
												<Share sx={{ fontSize: 19 }} />
											</button>
										</Stack>

										<IconButton onClick={prevImage} className="prev-button" aria-label={t('previous_image')}>
											<ArrowBackIosIcon fontSize="small" />
										</IconButton>

										<div
											className="image-zoom-container"
											onMouseEnter={handleMouseEnter}
											onMouseLeave={handleMouseLeave}
											onMouseMove={handleMouseMove}
										>
											<img
												src={slideImage ? `${REACT_APP_API_URL}/${slideImage}` : '/img/property/bigImage.png'}
												alt={t('main_image')}
												className="mainImage"
												style={{
													transform: isZoomed ? 'scale(2)' : 'scale(1)',
													transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`,
												}} loading="lazy" decoding="async" />

											{/* Zoom Icon Overlay - sichqoncha bilan birga harakat qiladi */}
											{!isZoomed && (
												<div
													className="zoom-icon-overlay"
													style={{
														left: `${mousePosition.x}%`,
														top: `${mousePosition.y}%`,
														transform: 'translate(-50%, -50%)',
													}}
												>
													<ZoomInIcon style={{ color: 'white', fontSize: '4px' }} />
												</div>
											)}
										</div>

										<IconButton onClick={nextImage} className="next-button" aria-label={t('next_image')}>
											<ArrowForwardIosIcon fontSize="small" />
										</IconButton>
									</Stack>

									<Stack className="thumbnailContainer">
										{images.map((subImg: string) => {
											const imagePath = `${REACT_APP_API_URL}/${subImg}`;
											return (
												<Stack
													className={`thumbnail ${slideImage === subImg ? 'active' : ''}`}
													onClick={() => changeImageHandler(subImg)}
													key={subImg}
												>
													<img src={imagePath} alt={t('sub_image')} loading="lazy" decoding="async" />
												</Stack>
											);
										})}
									</Stack>
								</Stack>

								<Stack className="productInfo">
									<Typography className="category">
										{t(property?.propertyCategory || 'unknown_category', 'Category not available')}
									</Typography>

									<Stack className="titleRow">
										<Typography variant="h4" className="title">
											{localizedTitle}
										</Typography>
										<Chip
											label={property?.propertyInStock ? t('in_stock') : t('out_of_stock')}
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
											<Rating readOnly size="small" value={property?.propertyRating || 0} precision={0.1} sx={{ color: 'var(--star)', '& .MuiRating-iconEmpty': { color: '#e0e0e0' } }} />
											<Typography variant="body2" sx={{ fontWeight: 600, color: 'var(--text-1)' }}>
												{property?.propertyRating ? property.propertyRating.toFixed(1) : '0.0'}
											</Typography>
											{property?.propertyReviews ? (
												<Typography variant="body2" sx={{ color: 'var(--text-3)', fontSize: 13 }}>
													({property.propertyReviews} {t('reviews')})
												</Typography>
											) : null}
										</Stack>
										{property?.propertySoldCount ? (
											<Typography variant="body2" sx={{ color: 'var(--text-3)', fontSize: 13 }}>
												{formatCount(property.propertySoldCount)}+ {t('sold')}
											</Typography>
										) : null}
									</Stack>

									<Stack className="priceRow">
										<Typography className="currentPrice">
											{formatPrice(property?.propertySalePrice || property?.propertyPrice)}
										</Typography>
										{property?.propertySalePrice && (
											<Typography className="originalPrice">{formatPrice(property?.propertyPrice)}</Typography>
										)}
									</Stack>

									<Typography className="description">
										{localizedDesc || t('no_description_provided')}
									</Typography>

									<Stack className="colorSection" direction="row" alignItems="center" gap={1}>
										<Typography className="colorLabel">
											{t('color')}: {t(property?.propertyColor || 'not_available')?.toLowerCase()}
										</Typography>

										{property?.propertyColor && (
											<Stack
												className="colorDot"
												sx={{
													width: '20px',
													height: '20px',
													borderRadius: '50%',
													backgroundColor: property.propertyColor.toLowerCase(),
													border: '1px solid var(--border)',
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
											<Button
												className="addToCartBtn"
												variant="contained"
												onClick={handleAddToCart}
												disabled={isOutOfStock}
											>
												{t('add_to_cart')}
											</Button>
											<ArLaunchButton
												modelUrl={
													property.propertyArModel ? `${REACT_APP_API_URL}/${property.propertyArModel}` : undefined
												}
												title={localizedTitle}
												category={property.propertyCategory}
												posterUrl={
													property.propertyImages?.[0] ? `${REACT_APP_API_URL}/${property.propertyImages[0]}` : undefined
												}
											/>
										</Stack>
									</Stack>

									<Stack className="buttons">
										<Stack className="button-box">
											<span className="metaLabel">{t('views')} :</span>
											<RemoveRedEyeIcon fontSize="medium" />
											<Typography>{formatCount(property?.propertyViews)}</Typography>
										</Stack>
										<Stack className="button-box" onClick={() => likePropertyHandler(user, property!._id)}>
											{property?.meLiked && property?.meLiked[0]?.myFavorite ? (
												<FavoriteIcon color="primary" fontSize="medium" />
											) : (
												<FavoriteBorderIcon fontSize="medium" />
											)}
											<Typography>{formatCount(property?.propertyLikes)}</Typography>
										</Stack>
									</Stack>

									<Stack className="productMeta">
										<Stack className="metaRow">
											<span className="metaLabel1">{t('tags')} :</span>
											<span className="metaValue">{t(property?.propertyType || 'not_available')}</span>
										</Stack>

										<Stack className="metaRow">
											<span className="metaLabel">{t('material')} :</span>
											<span className="metaValue">{t(property?.propertyMaterial || 'not_available')}</span>
										</Stack>
									</Stack>
								</Stack>
							</Stack>
						</Stack>

						<Stack className={'property-desc-config'}>
							<Stack className="left-config">
								<Tabs value={tabIndex} onChange={handleTabChange} className="property-tabs">
									<Tab label={t('description')} />
									<Tab label={`${t('reviews')} (${reviewTotal})`} />
								</Tabs>

								{tabIndex === 0 && (
									<Stack className="prop-desc-config">
										<Stack className="top-section">
											<Typography className="main-title">{t('property_description')}</Typography>
											<Typography className="description-text">
												{localizedDesc || t('no_description')}
											</Typography>
										</Stack>

										<Stack className="bottom-section" direction="row">
											<Stack className="details-container">
												{/* Features Section */}
												<Box component="div" className="details-section">
													<Box component="div" className="section-header">
														<Typography className="header-text">{t('features')}</Typography>
														<Typography className="header-text">{t('details')}</Typography>
													</Box>

													<Box component="div" className="detail-row">
														<span className="detail-label">{t('brand')}</span>
														<span className="detail-value">{localizedTitle || t('not_available')}</span>
													</Box>

													<Box component="div" className="detail-row alternate">
														<span className="detail-label">{t('color')}</span>
														<span className="detail-value">{property?.propertyColor || t('not_available')}</span>
													</Box>

													<Box component="div" className="detail-row">
														<span className="detail-label">{t('product_dimensions')}</span>
														<span className="detail-value">
															{property?.propertySize ? `${property.propertySize} ${t('cm')}` : t('not_available')}
														</span>
													</Box>

													<Box component="div" className="detail-row alternate">
														<span className="detail-label">{t('size')}</span>
														<span className="detail-value">
															{property?.propertySize ? `${property.propertySize} ${t('cm')}` : t('not_available')}
														</span>
													</Box>

													<Box component="div" className="detail-row">
														<span className="detail-label">{t('material')}</span>
														<span className="detail-value">{property?.propertyMaterial || t('not_available')}</span>
													</Box>

													<Box component="div" className="detail-row alternate">
														<span className="detail-label">{t('style')}</span>
														<span className="detail-value">{property?.propertyType || t('modern')}</span>
													</Box>

													<Box component="div" className="detail-row">
														<span className="detail-label">{t('unit_count')}</span>
														<span className="detail-value">{t('count_value')}</span>
													</Box>
												</Box>

												{/* Information Section */}
												<Box component="div" className="details-section">
													<Box component="div" className="section-header">
														<Typography className="header-text">{t('features')}</Typography>
														<Typography className="header-text">{t('information')}</Typography>
													</Box>

													<Box component="div" className="detail-row">
														<span className="detail-label">{t('category')}</span>
														<span className="detail-value">
															{t((property?.propertyCategory as string) ?? 'not_available')}
														</span>
													</Box>

													<Box component="div" className="detail-row alternate">
														<span className="detail-label">{t('customer_reviews')}</span>
														<span className="detail-value" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
															<Rating readOnly size="small" value={property?.propertyRating || 0} precision={0.1} sx={{ color: 'var(--star)', '& .MuiRating-iconEmpty': { color: '#e0e0e0' } }} />
															<span style={{ fontWeight: 600 }}>{property?.propertyRating ? property.propertyRating.toFixed(1) : '0.0'}</span>
															{property?.propertyReviews ? <span style={{ color: 'var(--text-3)', fontSize: 12 }}>({property.propertyReviews})</span> : null}
														</span>
													</Box>
													<Box component="div" className="detail-row">
														<span className="detail-label">{t('sold')}</span>
														<span className="detail-value">{formatCount(property?.propertySoldCount)}+</span>
													</Box>

													<Box component="div" className="detail-row">
														<span className="detail-label">{t('product_dimensions')}</span>
														<span className="detail-value">
															{property?.propertySize ? `${property.propertySize} ${t('cm')}` : t('not_available')}
														</span>
													</Box>

													<Box component="div" className="detail-row alternate">
														<span className="detail-label">{t('price')}</span>
														<span className="detail-value">{formatPrice(property?.propertyPrice)}</span>
													</Box>

													{property?.propertyIsOnSale && (
														<>
															<Box component="div" className="detail-row">
																<span className="detail-label">{t('sale_price')}</span>
																<span className="detail-value">{formatPrice(property?.propertySalePrice)}</span>
															</Box>

															<Box component="div" className="detail-row alternate">
																<span className="detail-label">{t('sale_ends')}</span>
																<span className="detail-value">
																	{moment(property?.propertySaleExpiresAt).format('DD MMM YYYY')}
																</span>
															</Box>
														</>
													)}

													<Box component="div" className="detail-row">
														<span className="detail-label">{t('condition')}</span>
														<span className="detail-value">{property?.propertyCondition || t('new')}</span>
													</Box>
												</Box>
											</Stack>
										</Stack>
									</Stack>
								)}

								{tabIndex === 1 && (
									<Stack className="repair-detail__comments" spacing={3}>
										{property?._id && <ReviewSection propertyId={property._id} />}
									</Stack>
								)}
							</Stack>

							<Stack className={'right-config'}>
								<Stack className={'info-box'}>
									<Typography className={'main-title'}>{t('get_more_information')}</Typography>
									<Stack className={'image-info'}>
										<img
											className={'member-image'}
											src={
												property?.memberData?.memberImage
													? (property?.memberData?.memberImage?.startsWith('http') ? property?.memberData?.memberImage : `${REACT_APP_API_URL}/${property?.memberData?.memberImage}`)
													: '/img/profile/defaultUser.svg'
											} loading="lazy" decoding="async" />
										<Stack className={'name-phone-listings'}>
											<Link href={`/member?memberId=${property?.memberData?._id}`}>
												<Typography className={'name'}>{property?.memberData?.memberNick}</Typography>
											</Link>

											<Stack className={'phone-number'}>
												<svg xmlns="http://www.w3.org/2000/svg" width="17" height="16" viewBox="0 0 17 16" fill="none">
													<g clipPath="url(#clip0_6507_6774)">
														<path
															d="M16.2858 10.11L14.8658 8.69C14.5607 8.39872 14.1551 8.23619 13.7333 8.23619C13.3115 8.23619 12.9059 8.39872 12.6008 8.69L12.1008 9.19C11.7616 9.528 11.3022 9.71778 10.8233 9.71778C10.3444 9.71778 9.88506 9.528 9.54582 9.19C9.16082 8.805 8.91582 8.545 8.67082 8.29C8.42582 8.035 8.17082 7.76 7.77082 7.365C7.43312 7.02661 7.24347 6.56807 7.24347 6.09C7.24347 5.61193 7.43312 5.15339 7.77082 4.815L8.27082 4.315C8.41992 4.16703 8.53822 3.99099 8.61889 3.79703C8.69956 3.60308 8.741 3.39506 8.74082 3.185C8.739 2.76115 8.57012 2.35512 8.27082 2.055L6.85082 0.625C6.44967 0.225577 5.9069 0.000919443 5.34082 0C5.06197 0.000410905 4.78595 0.0558271 4.52855 0.163075C4.27116 0.270322 4.03745 0.427294 3.84082 0.625L2.48582 1.97C1.50938 2.94779 0.960937 4.27315 0.960938 5.655C0.960937 7.03685 1.50938 8.36221 2.48582 9.34C3.26582 10.12 4.15582 11 5.04082 11.92C5.92582 12.84 6.79582 13.7 7.57082 14.5C8.5484 15.4749 9.87269 16.0224 11.2533 16.0224C12.6339 16.0224 13.9582 15.4749 14.9358 14.5L16.2858 13.15C16.6828 12.7513 16.9073 12.2126 16.9108 11.65C16.9157 11.3644 16.8629 11.0808 16.7555 10.8162C16.6481 10.5516 16.4884 10.3114 16.2858 10.11ZM15.5308 12.375L15.3858 12.5L13.9358 11.045C13.8875 10.99 13.8285 10.9455 13.7623 10.9142C13.6961 10.8829 13.6243 10.8655 13.5511 10.8632C13.478 10.8608 13.4051 10.8734 13.337 10.9003C13.269 10.9272 13.2071 10.9678 13.1554 11.0196C13.1036 11.0713 13.0631 11.1332 13.0361 11.2012C13.0092 11.2693 12.9966 11.3421 12.999 11.4153C13.0014 11.4884 13.0187 11.5603 13.05 11.6265C13.0813 11.6927 13.1258 11.7517 13.1808 11.8L14.6558 13.275L14.2058 13.725C13.4279 14.5005 12.3743 14.936 11.2758 14.936C10.1774 14.936 9.12372 14.5005 8.34582 13.725C7.57582 12.955 6.70082 12.065 5.84582 11.175C4.99082 10.285 4.06582 9.37 3.28582 8.59C2.51028 7.81209 2.0748 6.75845 2.0748 5.66C2.0748 4.56155 2.51028 3.50791 3.28582 2.73L3.73582 2.28L5.16082 3.75C5.26027 3.85277 5.39648 3.91182 5.53948 3.91417C5.68247 3.91651 5.82054 3.86196 5.92332 3.7625C6.02609 3.66304 6.08514 3.52684 6.08748 3.38384C6.08983 3.24084 6.03527 3.10277 5.93582 3L4.43582 1.5L4.58082 1.355C4.67935 1.25487 4.79689 1.17543 4.92654 1.12134C5.05619 1.06725 5.19534 1.03959 5.33582 1.04C5.61927 1.04085 5.89081 1.15414 6.09082 1.355L7.51582 2.8C7.61472 2.8998 7.6704 3.0345 7.67082 3.175C7.67088 3.24462 7.65722 3.31358 7.63062 3.37792C7.60403 3.44226 7.56502 3.50074 7.51582 3.55L7.01582 4.05C6.47844 4.58893 6.17668 5.31894 6.17668 6.08C6.17668 6.84106 6.47844 7.57107 7.01582 8.11C7.43582 8.5 7.66582 8.745 7.93582 9C8.20582 9.255 8.43582 9.53 8.83082 9.92C9.36974 10.4574 10.0998 10.7591 10.8608 10.7591C11.6219 10.7591 12.3519 10.4574 12.8908 9.92L13.3908 9.42C13.4929 9.32366 13.628 9.26999 13.7683 9.26999C13.9087 9.26999 14.0437 9.32366 14.1458 9.42L15.5658 10.84C15.6657 10.9387 15.745 11.0563 15.7991 11.1859C15.8532 11.3155 15.8809 11.4546 15.8808 11.595C15.8782 11.7412 15.8459 11.8853 15.7857 12.0186C15.7255 12.1518 15.6388 12.2714 15.5308 12.37V12.375Z"
															fill="var(--text-1)"
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
											<Typography className={'listings'}>{t('view_listings')}</Typography>
										</Stack>
									</Stack>
								</Stack>

								<Stack className={'info-box'}>
									<Typography className={'sub-title'}>{t('name')}</Typography>
									<input type={'text'} placeholder={t('enter_your_name')} value={contactName} onChange={(e) => setContactName(e.target.value)} />
								</Stack>

								<Stack className={'info-box'}>
									<Typography className={'sub-title'}>{t('phone')}</Typography>
									<input type={'text'} placeholder={t('enter_your_phone')} value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
								</Stack>

								<Stack className={'info-box'}>
									<Typography className={'sub-title'}>{t('message')}</Typography>
									<textarea placeholder={t('message_placeholder')} value={contactMessage} onChange={(e) => setContactMessage(e.target.value)}></textarea>
								</Stack>

								<Stack className={'info-box'}>
									<Button className={'send-message'} onClick={sendMessageHandler} disabled={sendingMessage}>
										<Typography className={'title'}>{sendingMessage ? t('Sending...') : t('send_message')}</Typography>
									</Button>
								</Stack>
							</Stack>
						</Stack>

						{destinationProperties.length !== 0 && (
							<Stack className={'similar-properties-config'}>
								<Stack className={'title-pagination-box'}>
									<Stack className={'title-box'}>
										<Typography className="main-title">{t('destination_furniture')}</Typography>
										<Typography className="sub-title">{t('comfort_style_durability')}</Typography>
									</Stack>
									<Box component={'div'} className={'right'}>
										<div className="pagination-box">
											<button className={'swiper-similar-prev'}>
												<WestIcon />
											</button>
											<button className={'swiper-similar-next'}>
												<EastIcon />
											</button>
										</div>
									</Box>
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
									>
										{destinationProperties.map((property: Property) => {
											return (
												<SwiperSlide className={'similar-homes-slide'} key={property.propertyTitle}>
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
					<ShareModal open={shareOpen} onClose={() => setShareOpen(false)} url={getShareUrl()} title={localizedTitle || 'Zinfurn'} text={getShareText()} />
				</div>
			</div>
		);
	}

	return null;
};

export default withLayoutFull(PropertyDetail);
