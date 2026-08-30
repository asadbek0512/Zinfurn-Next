import React, { useState } from 'react';
import { Box, Stack, Typography, IconButton } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import CheckIcon from '@mui/icons-material/Check';
import { useRouter } from 'next/router';
import { Property } from '../../types/property/property';
import { REACT_APP_API_URL } from '../../config';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { useTranslation } from 'next-i18next';
import { formatCount } from '../../utils';
import { addToCart } from '../../utils/cartUtils';
import { flyToCart } from '../../utils/flyToCart';
import { useCurrency } from '../../context/CurrencyContext';
import { getLocalizedTitle } from '../../utils/localizeProperty';

interface TrendPropertyCardProps {
	property: Property;
	likePropertyHandler: (user: any, propertyId: string) => void;
	myFavorites?: boolean;
	recentlyVisited?: boolean;
}

const TrendPropertyCard = ({ property, likePropertyHandler }: TrendPropertyCardProps) => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [isHovered, setIsHovered] = useState(false);
	const [addedFlash, setAddedFlash] = useState(false);
	const { t } = useTranslation('common');
	const { formatPrice } = useCurrency();

	const imagePath = property?.propertyImages?.[0]
		? `${REACT_APP_API_URL}/${property.propertyImages[0]}`
		: '/img/banner/header1.svg';
	const title = getLocalizedTitle(property, router.locale);

	const pushDetailHandler = (id: string) => {
		router.push({ pathname: '/products/detail', query: { id } });
	};

	const handleAddToCart = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (property?.propertyInStock === false) return;
		addToCart({
			_id: property._id,
			propertyTitle: title,
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

	// Hover qilganda 2-chi rasm, aks holda 1-chi rasm
	const backgroundImage =
		isHovered && property?.propertyImages?.[1]
			? `url(${REACT_APP_API_URL}/${property.propertyImages[1]})`
			: `url(${REACT_APP_API_URL}/${property.propertyImages?.[0]})`;

	return (
		<Box
			className={`product-card${property?.propertyInStock === false ? ' is-sold-out' : ''}`}
			component="div"
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
		>
			<Box className="product-image-container" component="div" onClick={() => pushDetailHandler(property._id)}>
				<Box
					className="product-image"
					component="div"
					sx={{
						backgroundImage: backgroundImage,
						transition: 'background-image 0.3s ease-in-out',
					}}
				/>

				{property?.propertyInStock === false && <span className="soldOutBadge">{t('sold_out')}</span>}

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

				<IconButton
					className={`big-card-cart-btn ${addedFlash ? 'added' : ''}`}
					onClick={handleAddToCart}
				>
					<AddShoppingCartIcon sx={{ fontSize: 18 }} />
				</IconButton>
			</Box>

			<Box className="product-info-container" component="div">
				<Box className="title-views-container" component="div">
					<Typography className="product-title">{title}</Typography>
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
							{property?.meLiked?.[0]?.myFavorite ? (
								<FavoriteIcon style={{ color: 'red' }} />
							) : (
								<FavoriteBorderIcon style={{ color: 'var(--text-4)' }} />
							)}
						</IconButton>
						<Typography className="likes-count">{formatCount(property?.propertyLikes)}</Typography>
					</Box>
				</Box>
			</Box>
		</Box>
	);
};

export default TrendPropertyCard;
