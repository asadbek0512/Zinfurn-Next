import React from 'react';
import { Stack, Box, Divider, Typography } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { Property } from '../../types/property/property';
import { REACT_APP_API_URL } from '../../config';
import { formatterStr } from '../../utils';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { useRouter } from 'next/router';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { useTranslation } from 'next-i18next';

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

	/** HANDLERS **/
	const goPropertyDetatilPage = (propertyId: string) => {
		router.push(`/property/detail?id=${propertyId}`);
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
									<Typography className="mob-big-card-sale-price">${formatterStr(property.propertySalePrice)}</Typography>
									<Typography className="mob-big-card-orig-price">${formatterStr(property.propertyPrice)}</Typography>
								</>
							) : (
								<Typography className="mob-big-card-sale-price">${formatterStr(property.propertyPrice)}</Typography>
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
						sx={{
							backgroundImage: `url(${REACT_APP_API_URL}/${property.propertyImages?.[0]})`,
						}}
					/>

					<Box className="top-badges" component="div">
						{/* Sale badge chap tomonda */}
						{discountPercent > 0 && (
							<Box className="discount-badge" component="div">
								<Typography className="discount-text">-{discountPercent}%</Typography>
							</Box>
						)}

						{/* Category badge o'ng tomonda */}
						<Box className="category-badge" component="div">
							<Typography className="category-text">{t(property.propertyCategory)}</Typography>
						</Box>
					</Box>
				</Box>

				<Box className="product-info-container" component="div">
					<Box className="title-views-container" component="div">
						<Typography className="product-title">{property.propertyTitle}</Typography>
					</Box>

					<Box className="price-like-container" component="div">
						<Box className="price-container" component="div">
							{property.propertySalePrice ? (
								<>
									<Typography className="original-price">${property.propertyPrice}</Typography>
									<Typography className="discounted-price">${property.propertySalePrice}</Typography>
								</>
							) : (
								<Typography className="discounted-price">${property.propertyPrice}</Typography>
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
							<Typography className="likes-count">{property?.propertyLikes}</Typography>
						</Box>
					</Box>
				</Box>
			</Box>
		);
	}
};

export default PropertyBigCard;
