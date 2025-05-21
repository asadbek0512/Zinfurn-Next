import React from 'react';
import { Stack, Box, Divider, Typography } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { Property } from '../../types/property/property';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { REACT_APP_API_URL } from '../../config';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';

interface TrendPropertyCardProps {
	property: Property;
	likePropertyHandler: any;
}

const TrendPropertyCard = (props: TrendPropertyCardProps) => {
	const { property, likePropertyHandler } = props;
	const device = useDeviceDetect();
	const router = useRouter();
	const user = useReactiveVar(userVar);

	/** HANDLERS **/
	const pushDetailHandler = async (propertyId: string) => {
		console.log('ID', propertyId);
		await router.push({ pathname: '/property/detail', query: { id: propertyId } });
	};

	if (device === 'mobile') {
		return (
			<Stack className="trend-card-box" key={property._id}>
				<Box
					component={'div'}
					className={'card-img'}
					style={{ backgroundImage: `url(${REACT_APP_API_URL}/${property?.propertyImages})` }}
					onClick={() => pushDetailHandler(property._id)}
				>
					<div>${property.propertyPrice}</div>
				</Box>
				<Box component={'div'} className={'info'}>
					<strong className={'title'} onClick={() => pushDetailHandler(property._id)}>
						{property.propertyTitle}
					</strong>
					<p className={'desc'}>{property.propertyDesc ?? 'no description'}</p>
					<div className={'options'}>
						<div>
							<img src="/img/icons/bed.svg" alt="" />
							<span>{property.propertyDesc} bed</span>
						</div>
						<div>
							<img src="/img/icons/room.svg" alt="" />
							<span>{property.propertyMaterial} rooms</span>
						</div>
						<div>
							<img src="/img/icons/expand.svg" alt="" />
							<span>{property.propertyCategory} m2</span>
						</div>
					</div>
					<Divider sx={{ mt: '15px', mb: '17px' }} />
					<div className={'bott'}>
						<p>
							{property.propertyRent ? 'Rent' : ''} {property.propertyRent && property.propertyBarter && '/'}{' '}
							{property.propertyBarter ? 'Barter' : ''}
						</p>
						<div className="view-like-box">
							<IconButton color={'default'} onClick={() => likePropertyHandler(user, property?._id)}>
								<RemoveRedEyeIcon />
							</IconButton>
							<Typography className="view-cnt">{property?.propertyViews}</Typography>
							<IconButton color={'default'}>
								{property?.meLiked && property?.meLiked[0]?.myFavorite ? (
									<FavoriteIcon style={{ color: 'red' }} />
								) : (
									<FavoriteIcon />
								)}
							</IconButton>
							<Typography className="view-cnt">{property?.propertyLikes}</Typography>
						</div>
					</div>
				</Box>
			</Stack>
		);
	} else {
		return (
			<Stack className="furniture-card" key={property._id}>
				<Box component={'div'} className="card-image-wrapper" onClick={() => pushDetailHandler(property._id)}>
					<Box
						component={'div'}
						className="card-image"
						style={{ backgroundImage: `url(${REACT_APP_API_URL}/${property?.propertyImages})` }}
					>
						<Box component={'div'} className="image-overlay">
							<Box component={'div'} className="top-badges">
								<Box component={'div'} className="material-badge">
									{property?.propertyMaterial}
								</Box>
								<Box component={'div'} className="size-badge">
									{property?.propertySize}
								</Box>
							</Box>
							<Box component={'div'} className="price-badge">
								${property?.propertyPrice}
							</Box>
						</Box>
					</Box>
				</Box>

				<Box component={'div'} className="card-content">
					<Box component={'div'} className="card-header">
						<Typography className="title" onClick={() => pushDetailHandler(property._id)}>
							{property?.propertyTitle}
						</Typography>
						<Typography className="category">{property?.propertyCategory}</Typography>
					</Box>

					<Typography className="description">{property?.propertyDesc}</Typography>

					<Box component={'div'} className="card-footer">
						<Box component={'div'} className="comment-box">
							<ChatBubbleOutlineIcon className="comment-icon" />
							<Typography className="comment-count">{property?.propertyComments || 0}</Typography>
						</Box>

						<Box component={'div'} className="interaction-buttons">
							<Box component={'div'} className="view-box">
								<RemoveRedEyeIcon className="icon" />
								<Typography className="count">{property?.propertyViews}</Typography>
							</Box>

							<Box component={'div'} className="like-box">
								{property?.meLiked && property?.meLiked[0]?.myFavorite ? (
									<FavoriteIcon className="icon liked" />
								) : (
									<FavoriteIcon className="icon" />
								)}
								<Typography className="count">{property?.propertyLikes}</Typography>
							</Box>
						</Box>
					</Box>
				</Box>
			</Stack>
		);
	}
};

export default TrendPropertyCard;
