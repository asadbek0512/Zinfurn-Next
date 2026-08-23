import React, { useState } from 'react';
import { Stack, Box, Typography, Rating } from '@mui/material';
import Link from 'next/link';
import IconButton from '@mui/material/IconButton';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import CheckIcon from '@mui/icons-material/Check';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { formatterStr, formatCount } from '../../utils';
import { REACT_APP_API_URL } from '../../config';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { addToCart } from '../../utils/cartUtils';
import { flyToCart } from '../../utils/flyToCart';
import { Property } from '../../types/property/property';
import { useTranslation } from 'next-i18next';
import { getLocalizedTitle } from '../../utils/localizeProperty';
import { useCurrency } from '../../context/CurrencyContext';

interface PropertyCardProps {
	property: Property;
	likePropertyHandler?: any;
	myFavorites?: boolean;
	recentlyVisited?: boolean;
}

const PropertyCard = (props: PropertyCardProps) => {
	const { property, likePropertyHandler, myFavorites, recentlyVisited } = props;
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const { t, i18n } = useTranslation('common');
	const { formatPrice } = useCurrency();
	const title = getLocalizedTitle(property, i18n.language);
	const imagePath: string = property?.propertyImages?.[0]
		? `${REACT_APP_API_URL}/${property?.propertyImages?.[0]}`
		: '/img/banner/header1.svg';

	const [isHovered, setIsHovered] = useState(false);
	const [addedFlash, setAddedFlash] = useState(false);

	const hoverImagePath: string =
		isHovered && property?.propertyImages?.[1]
			? `${REACT_APP_API_URL}/${property.propertyImages[1]}`
			: imagePath;

	const discountPercent =
		property?.propertyPrice && property?.propertySalePrice
			? Math.round(((property.propertyPrice - property.propertySalePrice) / property.propertyPrice) * 100)
			: 0;

	// propertyInStock aniq `false` bo'lsagina tugagan deb hisoblanadi (undefined = ma'lumot yo'q)
	const isOutOfStock = property?.propertyInStock === false;

	const handleAddToCart = (e: React.MouseEvent | React.KeyboardEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (isOutOfStock) return;
		addToCart({
			_id: property?._id,
			propertyTitle: title,
			propertyPrice: property?.propertyPrice,
			propertySalePrice: property?.propertySalePrice,
			propertyImages: property?.propertyImages,
			propertyType: property?.propertyType,
			memberNick: property?.memberData?.memberNick,
		});
		setAddedFlash(true);
		setTimeout(() => setAddedFlash(false), 2000);
		flyToCart(e.currentTarget as HTMLElement, imagePath);
	};

	if (device === 'mobile') {
		return (
			<Stack className={`mob-property-card${isOutOfStock ? ' is-sold-out' : ''}`}>
				<Link href={{ pathname: '/property/detail', query: { id: property?._id } }} className="mob-card-img-wrap">
					<img loading="lazy" decoding="async" src={imagePath} alt={title || 'Property'} className="mob-card-img" />
					{discountPercent > 0 && <span className="mob-sale-badge">-{discountPercent}%</span>}
					<span className="mob-cat-badge">{t(property?.propertyCategory)}</span>
					{isOutOfStock && <span className="soldOutBadge">{t('sold_out')}</span>}
				</Link>

				<Stack className="mob-card-info">
					{/* Rating + sold */}
					<div className="mob-card-rating">
						<Rating readOnly size="small" value={property?.propertyRating || 0} precision={0.1}
							sx={{ fontSize: 12, color: 'var(--star)', '& .MuiRating-iconEmpty': { color: '#e0e0e0' } }} />
						{property?.propertyRating ? (
							<span className="mob-card-rating-val">{property.propertyRating.toFixed(1)}</span>
						) : null}
						{property?.propertySoldCount ? (
							<span className="mob-card-sold">{formatCount(property.propertySoldCount)}+ sold</span>
						) : null}
					</div>

					<Link href={{ pathname: '/property/detail', query: { id: property?._id } }}>
						<Typography className="mob-card-title">{title}</Typography>
					</Link>

					<Stack className="mob-card-price">
						{discountPercent > 0 ? (
							<>
								<Typography className="mob-old-price">{formatPrice(property?.propertyPrice)}</Typography>
								<Typography className="mob-new-price">{formatPrice(property?.propertySalePrice)}</Typography>
							</>
						) : (
							<Typography className="mob-cur-price">{formatPrice(property?.propertyPrice)}</Typography>
						)}
					</Stack>

					{!recentlyVisited && (
						<div className="mob-card-actions">
							<div className="mob-action">
								<RemoveRedEyeIcon sx={{ fontSize: 13 }} />
								{formatCount(property?.propertyViews)}
							</div>
							<div className="mob-action">
								<ChatBubbleOutlineIcon sx={{ fontSize: 13 }} />
								{property?.propertyReviews || 0}
							</div>
							<div
								className="mob-action"
								role="button"
								tabIndex={0}
								aria-label={t('Like')}
								onClick={(e) => { e.preventDefault(); likePropertyHandler?.(user, property?._id); }}
								onKeyDown={(e) => {
									if (e.key === 'Enter' || e.key === ' ') {
										e.preventDefault();
										likePropertyHandler?.(user, property?._id);
									}
								}}
							>
								{myFavorites || property?.meLiked?.[0]?.myFavorite
									? <FavoriteIcon style={{ fontSize: 13, color: 'var(--primary)' }} />
									: <FavoriteBorderIcon style={{ fontSize: 13, color: 'var(--text-4)' }} />}
								{formatCount(property?.propertyLikes)}
							</div>
							<div
								className={`mob-action mob-action-cart ${addedFlash ? 'added' : ''}${isOutOfStock ? ' disabled' : ''}`}
								role="button"
								tabIndex={isOutOfStock ? -1 : 0}
								aria-disabled={isOutOfStock}
								aria-label={t('Add to Cart')}
								onClick={handleAddToCart}
								onKeyDown={(e) => {
									if (e.key === 'Enter' || e.key === ' ') {
										e.preventDefault();
										handleAddToCart(e);
									}
								}}
							>
								<AddShoppingCartIcon sx={{ fontSize: 13, color: 'var(--primary)' }} />
							</div>
						</div>
					)}
				</Stack>
			</Stack>
		);
	}

	// ── PC ──
	return (
		<Stack
			className={`card-config${isOutOfStock ? ' is-sold-out' : ''}`}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
		>
			<Stack className="top">
				<Link href={{ pathname: '/property/detail', query: { id: property?._id } }}>
					<img loading="lazy" decoding="async" src={hoverImagePath} alt={title || 'Property'} style={{ transition: 'opacity 0.3s' }} />
				</Link>

				{discountPercent > 0 && (
					<Box component="div" className="sale-badge">
						<Typography>-{discountPercent}%</Typography>
					</Box>
				)}

				<Box component="div" className="category-badge">
					<Typography>{t(property?.propertyCategory)}</Typography>
				</Box>

				{isOutOfStock && <span className="soldOutBadge">{t('sold_out')}</span>}
			</Stack>

			<Stack className="bottom">
				{/* Rating + sold count */}
				<div className="pc-card-rating">
					<Rating readOnly size="small" value={property?.propertyRating || 0} precision={0.1}
						sx={{ fontSize: 13, color: 'var(--star)', '& .MuiRating-iconEmpty': { color: '#e0e0e0' } }} />
					{property?.propertyRating ? (
						<span className="pc-card-rating-val">{property.propertyRating.toFixed(1)}</span>
					) : null}
					{property?.propertySoldCount ? (
						<span className="pc-card-sold">{formatCount(property.propertySoldCount)}+ sold</span>
					) : null}
				</div>

				<Stack className="title-section">
					<Link href={{ pathname: '/property/detail', query: { id: property?._id } }}>
						<Typography className="property-title">{title}</Typography>
					</Link>
				</Stack>

				<Stack className="price-section">
					{discountPercent > 0 ? (
						<Box component="div" className="price-container">
							<Typography className="old-price">{formatPrice(property?.propertyPrice)}</Typography>
							<Typography className="new-price">{formatPrice(property?.propertySalePrice)}</Typography>
						</Box>
					) : (
						<Typography className="current-price">{formatPrice(property?.propertyPrice)}</Typography>
					)}
				</Stack>

				{!recentlyVisited && (
					<button
						className={`pc-card-cart-btn ${addedFlash ? 'added' : ''}`}
						onClick={handleAddToCart}
						disabled={isOutOfStock}
					>
						<AddShoppingCartIcon sx={{ fontSize: 15 }} />{' '}
						{isOutOfStock ? t('out_of_stock') : t('Add to Cart')}
					</button>
				)}

				<Stack className="details">
					<Box component="div" className="detail-item">
						<Typography>{t(property?.propertyType)}</Typography>
					</Box>
					<Box component="div" className="detail-item">
						<Typography>{t(property?.propertyMaterial)}</Typography>
					</Box>
					<Box component="div" className="detail-item">
						<Typography>{t(property?.propertyCondition)}</Typography>
					</Box>
					<Box component="div" className="detail-item color-item">
						<Box
							component="div"
							className="color-indicator"
							style={{ backgroundColor: property?.propertyColor?.toLowerCase() || '#ccc' }}
						/>
						<Typography>{t(property?.propertyColor)}</Typography>
					</Box>
				</Stack>

				<Stack className="divider" />

				{!recentlyVisited && (
					<Stack className="action-buttons">
						<Box component="div" className="action-item">
							<IconButton size="small">
								<RemoveRedEyeIcon />
							</IconButton>
							<Typography>{formatCount(property?.propertyViews)}</Typography>
						</Box>
						<Box component="div" className="action-item">
							<IconButton size="small">
								<ChatBubbleOutlineIcon />
							</IconButton>
							<Typography>{property?.propertyReviews || 0}</Typography>
						</Box>
						<Box component="div" className="action-item">
							<IconButton size="small" onClick={() => likePropertyHandler?.(user, property?._id)}>
								{myFavorites || property?.meLiked?.[0]?.myFavorite ? (
									<FavoriteIcon style={{ color: 'var(--primary)' }} />
								) : (
									<FavoriteBorderIcon style={{ color: 'var(--text-4)' }} />
								)}
							</IconButton>
							<Typography>{formatCount(property?.propertyLikes)}</Typography>
						</Box>
					</Stack>
				)}
			</Stack>
		</Stack>
	);
};

export default PropertyCard;
