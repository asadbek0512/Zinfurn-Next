import React, { useState } from 'react';
import { Stack, Typography, Box } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import { Property } from '../../types/property/property';
import Link from 'next/link';
import { formatterStr } from '../../utils';
import { REACT_APP_API_URL, topPropertyRank } from '../../config';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import IconButton from '@mui/material/IconButton';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { useTranslation } from 'next-i18next';

interface PropertyCardType {
	property: Property;
	likePropertyHandler?: any;
	myFavorites?: boolean;
	recentlyVisited?: boolean;
}

const PropertyCard = (props: PropertyCardType) => {
	const { property, likePropertyHandler, myFavorites, recentlyVisited } = props;
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const [isHovered, setIsHovered] = useState(false);
	const { t } = useTranslation('common');

	// Debugging uchun
	console.log('Property images:', property?.propertyImages);
	console.log('Is hovered:', isHovered);

	// Image path - hover qilganda 2-chi rasm, aks holda 1-chi rasm
	const imagePath = isHovered && property?.propertyImages?.[1]
		? `${REACT_APP_API_URL}/${property.propertyImages[1]}`
		: property?.propertyImages?.[0] 
		? `${REACT_APP_API_URL}/${property.propertyImages[0]}`
		: '/img/banner/header1.svg';
	
	console.log('Image path:', imagePath);

	const discountPercent =
		property.propertyPrice && property.propertySalePrice
			? Math.round(((property.propertyPrice - property.propertySalePrice) / property.propertyPrice) * 100)
			: 0;

	if (device === 'mobile') {
		return (
			<Stack className="mob-property-card">
				{/* Chap: Rasm */}
				<Link href={{ pathname: '/property/detail', query: { id: property?._id } }} className="mob-card-img-wrap">
					<img src={imagePath} alt={property?.propertyTitle || 'Property'} className="mob-card-img" />
					{discountPercent > 0 && <span className="mob-sale-badge">-{discountPercent}%</span>}
					<span className="mob-cat-badge">{t(property?.propertyCategory)}</span>
				</Link>

				{/* O'ng: Ma'lumotlar */}
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

					<Stack className="mob-card-tags">
						<span className="mob-tag">{t(property?.propertyType)}</span>
						<span className="mob-tag">{t(property?.propertyMaterial)}</span>
						<span className="mob-tag">{t(property?.propertyCondition)}</span>
						<span className="mob-tag mob-color-tag">
							<span className="mob-color-dot" style={{ backgroundColor: property?.propertyColor?.toLowerCase() || '#ccc' }} />
							{t(property?.propertyColor)}
						</span>
					</Stack>

					{!recentlyVisited && (
						<Stack className="mob-card-actions">
							<span className="mob-action"><RemoveRedEyeIcon sx={{ fontSize: 15 }} />{property?.propertyViews || 0}</span>
							<span className="mob-action"><ChatBubbleOutlineIcon sx={{ fontSize: 15 }} />{property?.propertyComments || 0}</span>
							<span className="mob-action" onClick={() => likePropertyHandler?.(user, property?._id)}>
								{myFavorites || property?.meLiked?.[0]?.myFavorite
									? <FavoriteIcon sx={{ fontSize: 15, color: 'red' }} />
									: <FavoriteBorderIcon sx={{ fontSize: 15, color: '#bbb' }} />}
								{property?.propertyLikes || 0}
							</span>
						</Stack>
					)}
				</Stack>
			</Stack>
		);
	} else {
		return (
			<Stack className="card-config" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
				<Stack className="top">
					<Link
						href={{
							pathname: '/property/detail',
							query: { id: property?._id },
						}}
					>
						<img
							src={imagePath}
							alt={property?.propertyTitle || 'Property'}
							style={{
								transition: 'opacity 0.3s ease-in-out',
							}}
						/>
					</Link>

					{/* Sale badge - o'ng tarafda */}
					{discountPercent > 0 && (
						<Box component={'div'} className={'sale-badge'}>
							<Typography>-{discountPercent}%</Typography>
						</Box>
					)}

					{/* Category badge - chap tarafda */}
					<Box component={'div'} className={'category-badge'}>
						<Typography>{t(property?.propertyCategory)}</Typography>
					</Box>
				</Stack>

				<Stack className="bottom">
					{/* Title */}
					<Stack className="title-section">
						<Link
							href={{
								pathname: '/property/detail',
								query: { id: property?._id },
							}}
						>
							<Typography className="property-title">{property?.propertyTitle}</Typography>
						</Link>
					</Stack>

					{/* Price */}
					<Stack className="price-section">
						{discountPercent > 0 ? (
							<Box component={'div'} className="price-container">
								<Typography className="old-price">${formatterStr(property?.propertyPrice)}</Typography>
								<Typography className="new-price">${formatterStr(property?.propertySalePrice)}</Typography>
							</Box>
						) : (
							<Typography className="current-price">${formatterStr(property?.propertyPrice)}</Typography>
						)}
					</Stack>

					{/* Property details */}
					<Stack className="details">
						<Box component={'div'} className="detail-item">
							<Typography>{t(property?.propertyType)}</Typography>
						</Box>
						<Box component={'div'} className="detail-item">
							<Typography>{t(property?.propertyMaterial)}</Typography>
						</Box>
						<Box component={'div'} className="detail-item">
							<Typography>{t(property?.propertyCondition)}</Typography>
						</Box>
						<Box component={'div'} className="detail-item color-item">
							<Box
								component={'div'}
								className="color-indicator"
								style={{ backgroundColor: property?.propertyColor?.toLowerCase() || '#ccc' }}
							></Box>
							<Typography>{t(property?.propertyColor)}</Typography>
						</Box>
					</Stack>

					{/* Divider */}
					<Stack className="divider"></Stack>

					{/* Action buttons */}
					{!recentlyVisited && (
						<Stack className="action-buttons">
							{/* Views */}
							<Box component={'div'} className="action-item">
								<IconButton size="small">
									<RemoveRedEyeIcon />
								</IconButton>
								<Typography>{property?.propertyViews || 0}</Typography>
							</Box>

							{/* Comments */}
							<Box component={'div'} className="action-item">
								<IconButton size="small">
									<ChatBubbleOutlineIcon />
								</IconButton>
								<Typography>{property?.propertyComments || 0}</Typography>
							</Box>

							{/* Likes */}
							<Box component={'div'} className="action-item">
								<IconButton size="small" onClick={() => likePropertyHandler?.(user, property?._id)}>
									{myFavorites ? (
										<FavoriteIcon style={{ color: 'red' }} />
									) : property?.meLiked?.[0]?.myFavorite ? (
										<FavoriteIcon style={{ color: 'red' }} />
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
	}
};

export default PropertyCard;