import React, { useState } from 'react';
import { Stack, Box, Divider, Typography } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import FavoriteIcon from '@mui/icons-material/Favorite';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import CheckIcon from '@mui/icons-material/Check';
import { Property } from '../../types/property/property';
import { REACT_APP_API_URL } from '../../config';
import { formatterStr, formatCount } from '../../utils';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { useRouter } from 'next/router';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { useTranslation } from 'next-i18next';
import { useCurrency } from '../../context/CurrencyContext';
import { addToCart } from '../../utils/cartUtils';
import { flyToCart } from '../../utils/flyToCart';

interface PropertyBigCardProps {
	property: Property;
	likePropertyHandler?: any;
  myFavorites?: boolean;
}

const PropertyBigCard = (props: PropertyBigCardProps) => {
	const { property, likePropertyHandler } = props;
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const router = useRouter();
	const { t } = useTranslation('common');
	const { formatPrice } = useCurrency();
	const [addedFlash, setAddedFlash] = useState(false);

	const imagePath = property?.propertyImages?.[0]
		? `${REACT_APP_API_URL}/${property.propertyImages[0]}`
		: '/img/banner/header1.svg';

	/** HANDLERS **/
	const goPropertyDetatilPage = (propertyId: string) => {
		router.push(`/property/detail?id=${propertyId}`);
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

	if (device === 'mobile') {
		return (
			<Box className="mob-big-card" component="div" onClick={() => goPropertyDetatilPage(property._id)}>
				<Box className="mob-big-card-img-wrap" component="div">
					<Box
						className="mob-big-card-img"
						component="div"
						sx={{ backgroundImage: `url(${REACT_APP_API_URL}/${property.propertyImages?.[0]})` }}
					/>
					{discountPercent > 0 && (
						<span className="mob-big-card-sale">-{discountPercent}%</span>
					)}
					<span className="mob-big-card-cat">{t(property.propertyCategory)}</span>
				</Box>
				<Box className="mob-big-card-info" component="div">
					<Typography className="mob-big-card-title">{property.propertyTitle}</Typography>
					<Box className="mob-big-card-bottom" component="div">
						<Box className="mob-big-card-price" component="div">
							{property.propertySalePrice ? (
								<>
									<Typography className="mob-big-card-orig-price">{formatPrice(property.propertyPrice)}</Typography>
									<Typography className="mob-big-card-sale-price">{formatPrice(property.propertySalePrice)}</Typography>
								</>
							) : (
								<Typography className="mob-big-card-sale-price">{formatPrice(property.propertyPrice)}</Typography>
							)}
						</Box>
						<IconButton
							size="small"
							className="mob-big-card-like"
							onClick={(e) => { e.stopPropagation(); likePropertyHandler?.(user, property._id); }}
						>
							<FavoriteIcon style={{ fontSize: 16, color: property?.meLiked?.[0]?.myFavorite ? 'red' : '#ccc' }} />
						</IconButton>
					</Box>
				</Box>
			</Box>
		);
	} else {
		return (
			<Box className="product-card" component="div">
				<Box className="product-image-container" component="div" onClick={() => goPropertyDetatilPage(property._id)}>
					<Box
						className="product-image"
						component="div"
						sx={{ backgroundImage: `url(${imagePath})` }}
					/>

					<Box className="top-badges" component="div">
						{discountPercent > 0 && (
							<Box className="discount-badge" component="div">
								<Typography className="discount-text">-{discountPercent}%</Typography>
							</Box>
						)}
						<Box className="category-badge" component="div">
							<Typography className="category-text">{t(property.propertyCategory)}</Typography>
						</Box>
					</Box>

					{/* Hover cart button — pastki o'ng burchak */}
					<IconButton
						className={`big-card-cart-btn ${addedFlash ? 'added' : ''}`}
						onClick={handleAddToCart}
					>
						<AddShoppingCartIcon sx={{ fontSize: 18 }} />
					</IconButton>
				</Box>

				<Box className="product-info-container" component="div">
					<Box className="title-views-container" component="div">
						<Typography className="product-title">{property.propertyTitle}</Typography>
					</Box>

					<Box className="price-like-container" component="div">
						<Box className="price-container" component="div">
							{property.propertySalePrice ? (
								<>
									<Typography className="original-price">{formatPrice(property.propertyPrice)}</Typography>
									<Typography className="discounted-price">{formatPrice(property.propertySalePrice)}</Typography>
								</>
							) : (
								<Typography className="discounted-price">{formatPrice(property.propertyPrice)}</Typography>
							)}
						</Box>

						<Box className="likes-container" component="div">
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
							<Typography className="likes-count">{formatCount(property?.propertyLikes)}</Typography>
						</Box>
					</Box>
				</Box>
			</Box>
		);
	}
};

export default PropertyBigCard;
