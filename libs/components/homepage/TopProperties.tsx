import React, { useState } from 'react';
import { Stack, Box, Typography, IconButton, Link } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import FavoriteIcon from '@mui/icons-material/Favorite';
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

	const pushDetailHandler = (id: string) => {
		router.push({ pathname: '/property/detail', query: { id } });
	};

	const discountPercent =
		property.propertyPrice && property.propertySalePrice
			? Math.round(((property.propertyPrice - property.propertySalePrice) / property.propertyPrice) * 100)
			: 0;

	return (
		<Box component="div" className="product-card">
			<Box component="div" className="product-image-container" onClick={() => pushDetailHandler(property._id)}>
				<Box
					component="div"
					className="product-image"
					sx={{
						backgroundImage: `url(${REACT_APP_API_URL}/${property.propertyImages?.[0]})`,
					}}
				/>
				<Box component="div" className="top-badges">
					{/* Sale badge chap tomonda */}
					{discountPercent > 0 && (
						<Box component="div" className="discount-badge">
							<Typography className="discount-text">-{discountPercent}%</Typography>
						</Box>
					)}
					{/* Category badge o'ng tomonda */}
					<Box component="div" className="category-badge">
						<Typography className="category-text">{property.propertyCategory}</Typography>
					</Box>
				</Box>
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
								<Typography className="original-price">${property.propertyPrice}</Typography>
								<Typography className="discounted-price">${property.propertySalePrice}</Typography>
							</>
						) : (
							<Typography className="discounted-price">${property.propertyPrice}</Typography>
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
							<FavoriteIcon
								style={{
									color: property?.meLiked?.[0]?.myFavorite ? 'red' : '#41332d',
								}}
							/>
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
	const device = useDeviceDetect();
	const [activeTab, setActiveTab] = useState('top');
	const [properties, setProperties] = useState<Property[]>([]);

	const user = useReactiveVar(userVar);

	// Current input based on active tab
	const getCurrentInput = () => {
		switch (activeTab) {
			case 'all':
				return { ...latestInput, limit: 6 }; // All products with 6 limit
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

	/** APOLLO REQUESTS **/
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

	/** HANDLERS **/
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
		// Refetch data for the new tab
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
			<Stack className="products-collection mobile">
				<Stack className="container">
					<Stack className="info-box">
						<Typography className="section-subtitle">Our Products</Typography>
						<Typography className="section-title">Our Products Collections</Typography>
					</Stack>

					<Box component="div" className="tabs-container">
						{/* Birinchi qator - All Products */}
						<Box component="div" className="top-tab-row">
							<Box
								component="div"
								className={`tab-item ${activeTab === 'all' ? 'active' : ''}`}
								onClick={() => handleTabChange('all')}
							>
								All Products
							</Box>
						</Box>

						{/* Ikkinchi qator - Qolgan 3 ta tab */}
						<Box component="div" className="bottom-tabs-row">
							<Box
								component="div"
								className={`tab-item ${activeTab === 'top' ? 'active' : ''}`}
								onClick={() => handleTabChange('top')}
							>
								Top Properties
							</Box>
							<Box
								component="div"
								className={`tab-item ${activeTab === 'popular' ? 'active' : ''}`}
								onClick={() => handleTabChange('popular')}
							>
								Popular Properties
							</Box>
							<Box
								component="div"
								className={`tab-item ${activeTab === 'trend' ? 'active' : ''}`}
								onClick={() => handleTabChange('trend')}
							>
								Trend Properties
							</Box>
						</Box>
					</Box>

					<Stack className="card-box">
						{properties.length === 0 ? (
							<Box component="div" className="empty-list">
								No Products Found
							</Box>
						) : (
							<Swiper
								className="products-swiper"
								slidesPerView="auto"
								centeredSlides={true}
								spaceBetween={15}
								modules={[Autoplay]}
							>
								{properties.map((property: Property) => (
									<SwiperSlide key={property._id} className="product-slide">
										<ProductCard property={property} likePropertyHandler={likePropertyHandler} />
									</SwiperSlide>
								))}
							</Swiper>
						)}
					</Stack>
				</Stack>
			</Stack>
		);
	}

	return (
		<Stack className="products-collection">
			<Stack className="container">
				<Stack className="info-box">
					<Typography className="section-subtitle">Our Properties</Typography>
					<Typography className="section-title">Properties Collections</Typography>
				</Stack>

				<Box component="div" className="tabs-container">
					<Box
						component="div"
						className={`tab-item ${activeTab === 'top' ? 'active' : ''}`}
						onClick={() => handleTabChange('top')}
					>
						Top Properties
					</Box>
					<Box
						component="div"
						className={`tab-item ${activeTab === 'popular' ? 'active' : ''}`}
						onClick={() => handleTabChange('popular')}
					>
						Popular Properties
					</Box>
					<Box
						component="div"
						className={`tab-item ${activeTab === 'trend' ? 'active' : ''}`}
						onClick={() => handleTabChange('trend')}
					>
						Trend Properties
					</Box>
				</Box>

				<Stack className="card-box">
					{properties.length === 0 ? (
						<Box component="div" className="empty-list">
							No Products Found
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
					All Properties
				</Link>
			</Stack>
		</Stack>
	);
};

ProductsCollection.defaultProps = {
	latestInput: {
		page: 1,
		limit: 12, // 8 dan 12 ga oshirdim
		sort: 'createdAt',
		direction: 'DESC',
		search: {},
	},
	bestSellersInput: {
		page: 1,
		limit: 12, // 8 dan 12 ga oshirdim
		sort: 'propertyLikes',
		direction: 'DESC',
		search: {},
	},
	featuredInput: {
		page: 1,
		limit: 12, // 8 dan 12 ga oshirdim
		sort: 'propertyRank',
		direction: 'DESC',
		search: {},
	},
};

export default ProductsCollection;
