import React, { useState } from 'react';
import { Stack, Box, Typography } from '@mui/material';
import Link from 'next/link';
import IconButton from '@mui/material/IconButton';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import CheckIcon from '@mui/icons-material/Check';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { formatterStr } from '../../utils';
import { REACT_APP_API_URL } from '../../config';
import { useReactiveVar } from '@apollo/client';
import { userVar, cartDrawerVar } from '../../../apollo/store';
import { addToCart } from '../../utils/cartUtils';
import { Property } from '../../types/property/property';
import { useTranslation } from 'next-i18next';

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
	const { t } = useTranslation('common');
	const imagePath: string = property?.propertyImages?.[0]
		? `${REACT_APP_API_URL}/${property?.propertyImages?.[0]}`
		: '/img/banner/header1.svg';

	const [isHovered, setIsHovered] = useState(false);
	const [addedFlash, setAddedFlash] = useState(false);

	const discountPercent =
		property?.propertyPrice && property?.propertySalePrice
			? Math.round(((property.propertyPrice - property.propertySalePrice) / property.propertyPrice) * 100)
			: 0;

	const handleAddToCart = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		addToCart({
			_id: property?._id,
			propertyTitle: property?.propertyTitle,
			propertyPrice: property?.propertyPrice,
			propertySalePrice: property?.propertySalePrice,
			propertyImages: property?.propertyImages,
			propertyType: property?.propertyType,
			memberNick: property?.memberData?.memberNick,
		});
		setAddedFlash(true);
		setTimeout(() => setAddedFlash(false), 2000);
		cartDrawerVar(true);
	};

	if (device === 'mobile') {
		return (
			<Stack className="mob-property-card">
				<Link href={{ pathname: '/property/detail', query: { id: property?._id } }} className="mob-card-img-wrap">
					<img src={imagePath} alt={property?.propertyTitle || 'Property'} className="mob-card-img" />
					{discountPercent > 0 && <span className="mob-sale-badge">-{discountPercent}%</span>}
					<span className="mob-cat-badge">{t(property?.propertyCategory)}</span>
				</Link>

				<Stack className="mob-card-info">
					<Link href={{ pathname: '/property/detail', query: { id: property?._id } }}>
						<Typography className="mob-card-title">{property?.propertyTitle}</Typography>
					</Link>

					<Stack className="mob-card-price">
						{discountPercent > 0 ? (
							<>
								<Typography className="mob-new-price">${formatterStr(property?.propertySalePrice)}</Typography>
								<Typography className="mob-old-price">${formatterStr(property?.propertyPrice)}</Typography>
							</>
						) : (
							<Typography className="mob-cur-price">${formatterStr(property?.propertyPrice)}</Typography>
						)}
					</Stack>

					{!recentlyVisited && (
						<div className="mob-card-actions">
							<div className="mob-action">
								<RemoveRedEyeIcon sx={{ fontSize: 13 }} />
								{property?.propertyViews || 0}
							</div>
							<div className="mob-action">
								<ChatBubbleOutlineIcon sx={{ fontSize: 13 }} />
								{property?.propertyComments || 0}
							</div>
							<div
								className="mob-action"
								onClick={(e) => { e.preventDefault(); likePropertyHandler?.(user, property?._id); }}
							>
								{myFavorites || property?.meLiked?.[0]?.myFavorite
									? <FavoriteIcon sx={{ fontSize: 13, color: '#cf6422' }} />
									: <FavoriteBorderIcon sx={{ fontSize: 13, color: '#bbb' }} />}
								{property?.propertyLikes || 0}
							</div>
							<div
								className={`mob-action mob-action-cart ${addedFlash ? 'added' : ''}`}
								onClick={handleAddToCart}
							>
								{addedFlash
									? <CheckIcon sx={{ fontSize: 13, color: '#2e7d32' }} />
									: <AddShoppingCartIcon sx={{ fontSize: 13, color: '#cf6422' }} />}
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
			className="card-config"
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
		>
			<Stack className="top">
				<Link href={{ pathname: '/property/detail', query: { id: property?._id } }}>
					<img src={imagePath} alt={property?.propertyTitle || 'Property'} style={{ transition: 'opacity 0.3s' }} />
				</Link>

				{discountPercent > 0 && (
					<Box component="div" className="sale-badge">
						<Typography>-{discountPercent}%</Typography>
					</Box>
				)}

				<Box component="div" className="category-badge">
					<Typography>{t(property?.propertyCategory)}</Typography>
				</Box>
			</Stack>

			<Stack className="bottom">
				<Stack className="title-section">
					<Link href={{ pathname: '/property/detail', query: { id: property?._id } }}>
						<Typography className="property-title">{property?.propertyTitle}</Typography>
					</Link>
				</Stack>

				<Stack className="price-section">
					{discountPercent > 0 ? (
						<Box component="div" className="price-container">
							<Typography className="old-price">${formatterStr(property?.propertyPrice)}</Typography>
							<Typography className="new-price">${formatterStr(property?.propertySalePrice)}</Typography>
						</Box>
					) : (
						<Typography className="current-price">${formatterStr(property?.propertyPrice)}</Typography>
					)}
				</Stack>

				{!recentlyVisited && (
					<button
						className={`pc-card-cart-btn ${addedFlash ? 'added' : ''}`}
						onClick={handleAddToCart}
					>
						{addedFlash ? (
							<><CheckIcon sx={{ fontSize: 15 }} /> {t('Added!')}</>
						) : (
							<><AddShoppingCartIcon sx={{ fontSize: 15 }} /> {t('Add to Cart')}</>
						)}
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
							<Typography>{property?.propertyViews || 0}</Typography>
						</Box>
						<Box component="div" className="action-item">
							<IconButton size="small">
								<ChatBubbleOutlineIcon />
							</IconButton>
							<Typography>{property?.propertyComments || 0}</Typography>
						</Box>
						<Box component="div" className="action-item">
							<IconButton size="small" onClick={() => likePropertyHandler?.(user, property?._id)}>
								{myFavorites || property?.meLiked?.[0]?.myFavorite ? (
									<FavoriteIcon style={{ color: '#cf6422' }} />
								) : (
									<FavoriteBorderIcon style={{ color: '#bbb' }} />
								)}
							</IconButton>
							<Typography>{property?.propertyLikes || 0}</Typography>
						</Box>
					</Stack>
				)}
			</Stack>
		</Stack>
	);
};

export default PropertyCard;
