import React, { useState } from 'react';
import { Stack, Box, Typography, IconButton, Link } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import MobilePropertyCard from './MobilePropertyCard';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import CheckIcon from '@mui/icons-material/Check';
import { addToCart } from '../../utils/cartUtils';
import { flyToCart } from '../../utils/flyToCart';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper';
import { Property } from '../../types/property/property';
import { PropertiesInquiry } from '../../types/property/property.input';
import { useMutation, useQuery } from '@apollo/client';
import { GET_PROPERTIES } from '../../../apollo/user/query';
import { T } from '../../types/common';
import { LIKE_TARGET_PROPERTY } from '../../../apollo/user/mutation';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import { Message } from '../../enums/common.enum';
import { useRouter } from 'next/router';
import { REACT_APP_API_URL } from '../../config';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { useTranslation } from 'next-i18next';
import { useCurrency } from '../../context/CurrencyContext';

interface ProductsCollectionProps {
	latestInput: PropertiesInquiry;
	bestSellersInput: PropertiesInquiry;
	featuredInput: PropertiesInquiry;
}

interface ProductCardProps {
	property: Property;
	likePropertyHandler: (user: any, propertyId: string) => void;
}

const ProductCard = ({ property, likePropertyHandler }: ProductCardProps) => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [isHovered, setIsHovered] = useState(false);
	const [addedFlash, setAddedFlash] = useState(false);
	const { t } = useTranslation('common');
	const { formatPrice } = useCurrency();

	const imagePath = property?.propertyImages?.[0]
		? `${REACT_APP_API_URL}/${property.propertyImages[0]}`
		: '/img/banner/header1.svg';

	const pushDetailHandler = (id: string) => {
		router.push({ pathname: '/property/detail', query: { id } });
	};

	const handleAddToCart = (e: React.MouseEvent) => {
		e.stopPropagation();
		addToCart({
			_id: property._id,
			propertyTitle: property.propertyTitle,
			propertyPrice: property.propertyPrice,
			propertySalePrice: property.propertySalePrice,
			propertyImages: property.propertyImages,
			propertyType: property.propertyType,
		});
		setAddedFlash(true);
		setTimeout(() => setAddedFlash(false), 2000);
		flyToCart(e.currentTarget as HTMLElement, imagePath);
	};

	const discountPercent =
		property.propertyPrice && property.propertySalePrice
			? Math.round(((property.propertyPrice - property.propertySalePrice) / property.propertyPrice) * 100)
			: 0;

	const backgroundImage =
		isHovered && property?.propertyImages?.[1]
			? `url(${REACT_APP_API_URL}/${property.propertyImages[1]})`
			: `url(${REACT_APP_API_URL}/${property.propertyImages?.[0]})`;

	return (
		<Box
			component="div"
			className="product-card"
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
		>
			<Box component="div" className="product-image-container" onClick={() => pushDetailHandler(property._id)}>
				<Box
					component="div"
					className="product-image"
					sx={{
						backgroundImage: backgroundImage,
						transition: 'background-image 0.3s ease-in-out',
					}}
				/>
				<Box component="div" className="top-badges">
					{discountPercent > 0 && (
						<Box component="div" className="discount-badge">
							<Typography className="discount-text">-{discountPercent}%</Typography>
						</Box>
					)}
					<Box component="div" className="category-badge">
						<Typography className="category-text">{t(property.propertyCategory)}</Typography>
					</Box>
				</Box>

				<IconButton
					className={`big-card-cart-btn ${addedFlash ? 'added' : ''}`}
					onClick={handleAddToCart}
				>
					<AddShoppingCartIcon sx={{ fontSize: 18 }} />
				</IconButton>
			</Box>
			<Box component="div" className="product-info-container">
				<Box component="div" className="title-views-container">
					<Typography className="product-title">{property.propertyTitle}</Typography>
					<Box component="div" className="views-container">
						{/* <RemoveRedEyeIcon className="views-icon" /> */}
						{/* <Typography className="views-count">{property.propertyViews || 0}</Typography> */}
					</Box>
				</Box>
				<Box component="div" className="price-like-container">
					<Box component="div" className="price-container">
						{property.propertySalePrice ? (
							<>
								<Typography className="original-price">{formatPrice(property.propertyPrice)}</Typography>
								<Typography className="discounted-price">{formatPrice(property.propertySalePrice)}</Typography>
							</>
						) : (
							<Typography className="discounted-price">{formatPrice(property.propertyPrice)}</Typography>
						)}
					</Box>
					<Box component="div" className="likes-container">
						<IconButton
							className="like-button"
							onClick={(e) => {
								e.stopPropagation();
								likePropertyHandler(user, property._id);
							}}
						>
							{property?.meLiked?.[0]?.myFavorite ? (
								<FavoriteIcon style={{ color: 'red' }} />
							) : (
								<FavoriteBorderIcon style={{ color: '#bbb' }} />
							)}
						</IconButton>
						<Typography className="likes-count">{property?.propertyLikes}</Typography>
					</Box>
				</Box>
			</Box>
		</Box>
	);
};

const ProductsCollection = (props: ProductsCollectionProps) => {
	const { latestInput, bestSellersInput, featuredInput } = props;
	const router = useRouter();
	const device = useDeviceDetect();
	const [activeTab, setActiveTab] = useState('top');
	const [properties, setProperties] = useState<Property[]>([]);

	const user = useReactiveVar(userVar);
	const { t } = useTranslation('common');
	const { formatPrice } = useCurrency();

	const getCurrentInput = () => {
		switch (activeTab) {
			case 'all':
				return { ...latestInput, limit: 6 };
			case 'top':
				return { ...latestInput, limit: 6 };
			case 'popular':
				return bestSellersInput;
			case 'trend':
				return featuredInput;
			default:
				return latestInput;
		}
	};

	const [likeTargetProperty] = useMutation(LIKE_TARGET_PROPERTY);

	const {
		loading: getPropertiesLoading,
		data: getPropertiesData,
		error: getPropertiesError,
		refetch: getPropertiesRefetch,
	} = useQuery(GET_PROPERTIES, {
		fetchPolicy: 'cache-and-network',
		variables: { input: getCurrentInput() },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setProperties(data?.getProperties?.list || []);
		},
	});

	const likePropertyHandler = async (user: T, id: string) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);

			await likeTargetProperty({ variables: { input: id } });
			await getPropertiesRefetch({ input: getCurrentInput() });
		} catch (err: any) {
			console.log('ERROR, likePropertyHandler', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const handleTabChange = (tab: string) => {
		setActiveTab(tab);
		const inputMap = {
			all: { ...latestInput, limit: 6 },
			top: latestInput,
			popular: bestSellersInput,
			trend: featuredInput,
		};

		getPropertiesRefetch({
			input: inputMap[tab as keyof typeof inputMap] || latestInput,
		});
	};

	if (device === 'mobile') {
		return (
			<div style={{ padding: '16px 0', background: '#fff' }}>
				{/* Header */}
				<div style={{ padding: '0 16px 8px' }}>
					<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '10px', marginBottom: '6px' }}>
						<div style={{ width: '30px', height: '2px', background: '#cf6422' }} />
						<span style={{ fontSize: '13px', fontWeight: 500, color: '#000' }}>{t('Our Properties')}</span>
					</div>
					<div style={{ fontSize: '18px', fontWeight: 700, color: '#333' }}>{t('Properties Collections')}</div>
				</div>

				{/* Tabs */}
				<div style={{ display: 'flex', gap: '8px', padding: '10px 16px', overflowX: 'auto' }}>
					{[{ key: 'top', label: t('Top Properties') }, { key: 'popular', label: t('Popular') }, { key: 'trend', label: t('Trend') }].map((tab) => (
						<button key={tab.key} onClick={() => handleTabChange(tab.key)} style={{
							padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 500,
							border: activeTab === tab.key ? 'none' : '1px solid #ddd',
							background: activeTab === tab.key ? '#cf6422' : '#fff',
							color: activeTab === tab.key ? '#fff' : '#666',
							cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0
						}}>
							{tab.label}
						</button>
					))}
				</div>

				{/* Kartalar */}
				{properties.length === 0 ? (
					<div style={{ textAlign: 'center', padding: '32px', color: '#aaa' }}>{t('No Products Found')}</div>
				) : (
					<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', padding: '0 16px' }}>
						{properties.slice(0, 4).map((property: Property) => (
							<MobilePropertyCard key={property._id} property={property} likePropertyHandler={likePropertyHandler} />
						))}
					</div>
				)}

				<div style={{ display: 'flex', justifyContent: 'flex-end', padding: '10px 16px 0' }}>
					<span onClick={() => router.push('/property')} style={{ fontSize: '12px', color: '#cf6422', fontWeight: 500, cursor: 'pointer' }}>
						{t('All Furnitures')} →
					</span>
				</div>

			</div>
		);
	}

	return (
		<Stack className="products-collection">
			<Stack className="container">
				<Stack className="info-box">
					<Typography className="section-subtitle">{t('Our Properties')}</Typography>
					<Typography className="section-title">{t('Properties Collections')}</Typography>
				</Stack>

				<Box component="div" className="tabs-container">
					<Box
						component="div"
						className={`tab-item ${activeTab === 'top' ? 'active' : ''}`}
						onClick={() => handleTabChange('top')}
					>
						{t('Top Properties')}
					</Box>
					<Box
						component="div"
						className={`tab-item ${activeTab === 'popular' ? 'active' : ''}`}
						onClick={() => handleTabChange('popular')}
					>
						{t('Popular Properties')}
					</Box>
					<Box
						component="div"
						className={`tab-item ${activeTab === 'trend' ? 'active' : ''}`}
						onClick={() => handleTabChange('trend')}
					>
						{t('Trend Properties')}
					</Box>
				</Box>

				<Stack className="card-box">
					{properties.length === 0 ? (
						<Box component="div" className="empty-list">
							{t('No Products Found')}
						</Box>
					) : (
						<Box component="div" className="products-grid">
							{properties.slice(0, 6).map((property: Property) => (
								<ProductCard key={property._id} property={property} likePropertyHandler={likePropertyHandler} />
							))}
						</Box>
					)}
				</Stack>

				<Link href="/property" className="view-button">
					{t('All Properties')}
				</Link>
			</Stack>
		</Stack>
	);
};

ProductsCollection.defaultProps = {
	latestInput: {
		page: 1,
		limit: 12,
		sort: 'createdAt',
		direction: 'DESC',
		search: {},
	},
	bestSellersInput: {
		page: 1,
		limit: 12,
		sort: 'propertyLikes',
		direction: 'DESC',
		search: {},
	},
	featuredInput: {
		page: 1,
		limit: 12,
		sort: 'propertyRank',
		direction: 'DESC',
		search: {},
	},
};

export default ProductsCollection;
