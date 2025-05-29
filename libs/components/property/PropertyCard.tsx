import React from 'react';
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
  
  const imagePath: string = property?.propertyImages
    ? `${REACT_APP_API_URL}/${property?.propertyImages[0]}`
    : '/img/banner/header1.svg';

  const discountPercent = 
    property.propertyPrice && property.propertySalePrice
      ? Math.round(((property.propertyPrice - property.propertySalePrice) / property.propertyPrice) * 100)
      : 0;

  if (device === 'mobile') {
    return <div>PROPERTY CARD</div>;
  } else {
    return (
      <Stack className="card-config">
        <Stack className="top">
          <Link
            href={{
              pathname: '/property/detail',
              query: { id: property?._id },
            }}
          >
            <img src={imagePath} alt={property?.propertyTitle || 'Property'} />
          </Link>
          
          {/* Sale badge - o'ng tarafda */}
          {discountPercent > 0 && (
            <Box component={'div'} className={'sale-badge'}>
              <Typography>-{discountPercent}%</Typography>
            </Box>
          )}
          
          {/* Category badge - chap tarafda */}
          <Box component={'div'} className={'category-badge'}>
            <Typography>{property?.propertyCategory}</Typography>
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
                <Typography className="new-price">
                  ${formatterStr(property?.propertySalePrice)}
                </Typography>
              </Box>
            ) : (
              <Typography className="current-price">${formatterStr(property?.propertyPrice)}</Typography>
            )}
          </Stack>

          {/* Property details */}
          <Stack className="details">
            <Box component={'div'} className="detail-item">
              <Typography>{property?.propertyType}</Typography>
            </Box>
            <Box component={'div'} className="detail-item">
              <Typography>{property?.propertyMaterial}</Typography>
            </Box>
            <Box component={'div'} className="detail-item">
              <Typography>{property?.propertyCondition}</Typography>
            </Box>
            <Box component={'div'} className="detail-item color-item">
              <Box component={'div'} className="color-indicator" style={{ backgroundColor: property?.propertyColor?.toLowerCase() || '#ccc' }}></Box>
              <Typography>{property?.propertyColor}</Typography>
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

              {/* Likes */}
              <Box component={'div'} className="action-item">
                <IconButton 
                  size="small" 
                  onClick={() => likePropertyHandler?.(user, property?._id)}
                >
                  {myFavorites ? (
                    <FavoriteIcon style={{ color: 'red' }} />
                  ) : property?.meLiked?.[0]?.myFavorite ? (
                    <FavoriteIcon style={{ color: 'red' }} />
                  ) : (
                    <FavoriteBorderIcon />
                  )}
                </IconButton>
                <Typography>{property?.propertyLikes || 0}</Typography>
              </Box>

              {/* Comments */}
              <Box component={'div'} className="action-item">
                <IconButton size="small">
                  <ChatBubbleOutlineIcon />
                </IconButton>
                <Typography>{property?.propertyComments || 0}</Typography>
              </Box>
            </Stack>
          )}
        </Stack>
      </Stack>
    );
  }
};

export default PropertyCard;