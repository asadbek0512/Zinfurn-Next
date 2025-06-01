import React from 'react';
import { Box, Stack, Typography, IconButton } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { useRouter } from 'next/router';
import { Property } from '../../types/property/property';
import { REACT_APP_API_URL } from '../../config';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';

interface TrendPropertyCardProps {
	property: Property;
	likePropertyHandler: (user: any, propertyId: string) => void;
}

const TrendPropertyCard = ({ property, likePropertyHandler }: TrendPropertyCardProps) => {
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
		<Box className="product-card" component="div">
			<Box className="product-image-container" component="div" onClick={() => pushDetailHandler(property._id)}>
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
						<Typography className="category-text">{property.propertyCategory}</Typography>
					</Box>
				</Box>
			</Box>

			<Box className="product-info-container" component="div">
				<Box className="title-views-container" component="div">
					<Typography className="product-title">{property.propertyTitle}</Typography>
					<Box className="views-container" component="div">
						{/* <RemoveRedEyeIcon className="views-icon" /> */}
						{/* <Typography className="views-count">{property.propertyViews || 0}</Typography> */}
					</Box>
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
};

export default TrendPropertyCard;
