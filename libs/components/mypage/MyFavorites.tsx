import React, { useState } from 'react';
import { NextPage } from 'next';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Pagination, Stack, Typography } from '@mui/material';
import PropertyCard from '../property/PropertyCard';
import { Property } from '../../types/property/property';
import { T } from '../../types/common';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { LIKE_TARGET_PROPERTY } from '../../../apollo/user/mutation';
import { GET_FAVORITES } from '../../../apollo/user/query';
import { Messages, REACT_APP_API_URL } from '../../config';
import { sweetMixinErrorAlert } from '../../sweetAlert';
import PropertyBigCard from '../common/PropertyBigCard';
import TrendPropertyCard from '../homepage/TrendPropertyCard';
import { useTranslation } from 'next-i18next';
import { useCurrency } from '../../context/CurrencyContext';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useRouter } from 'next/router';
import { userVar } from '../../../apollo/store';

const MyFavorites: NextPage = () => {
  const { t } = useTranslation('common');
  const { formatPrice } = useCurrency();
  const device = useDeviceDetect();
  const router = useRouter();
  const user = useReactiveVar(userVar);
  const [myFavorites, setMyFavorites] = useState<Property[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [searchFavorites, setSearchFavorites] = useState<T>({ page: 1, limit: 6 });

  /** APOLLO REQUESTS **/
  const [likeTargetProperty] = useMutation(LIKE_TARGET_PROPERTY);

  const {
    loading: getFavoritesLoading,
    data: getFavoritesData,
    error: getFavoritesError,
    refetch: getFavoritesRefetch,
  } = useQuery(GET_FAVORITES, {
    fetchPolicy: 'network-only',
    variables: {
      input: searchFavorites,
    },
    notifyOnNetworkStatusChange: true,
    onCompleted(data) {
      setMyFavorites(data?.getFavorites?.list);
      setTotal(data?.getFavorites?.metaCounter?.[0]?.total || 0);
    },
  });

  /** HANDLERS **/
  const paginationHandler = (e: T, value: number) => {
    setSearchFavorites({ ...searchFavorites, page: value });
  };
  
  const likePropertyHandler = async (user: any, id: string) => {
    try {
      if (!id) return;
      if (!user?._id) throw new Error(Messages.error2);

      await likeTargetProperty({
        variables: {
          input: id,
        },
      });

      await getFavoritesRefetch({ input: searchFavorites });
    } catch (err: any) {
      console.error('ERROR, likePropertyHandler:', err.message);
      await sweetMixinErrorAlert(err.message).then();
    }
  };

  if (device === 'mobile') {
    return (
      <div id="mob-myfavorites">
        <div className="mob-fav-header">
          <h2>{t('My Favorites')}</h2>
          <span>{t('We are glad to see you again!')}</span>
        </div>
        <div className="mob-fav-list">
          {myFavorites?.length ? (
            myFavorites.map((property: Property) => {
              const imgSrc = property.propertyImages?.[0]
                ? `${REACT_APP_API_URL}/${property.propertyImages[0]}`
                : '/img/banner/Home-1-.jpg';
              const isLiked = property.meLiked?.[0]?.myFavorite;
              return (
                <div
                  key={property._id}
                  className="mob-fav-card"
                  onClick={() => router.push({ pathname: '/property/detail', query: { id: property._id } })}
                >
                  <div className="mob-fav-card-img-wrap">
                    <img src={imgSrc} alt="" />
                    {property.propertyPrice && (
                      <div className="mob-fav-badge">{formatPrice(property.propertyPrice)}</div>
                    )}
                    <div
                      className="mob-fav-like-btn"
                      onClick={(e) => { e.stopPropagation(); likePropertyHandler(user, property._id); }}
                    >
                      {isLiked
                        ? <FavoriteIcon sx={{ fontSize: 18, color: 'var(--primary)' }} />
                        : <FavoriteBorderIcon sx={{ fontSize: 18, color: 'var(--text-4)' }} />
                      }
                    </div>
                  </div>
                  <div className="mob-fav-card-body">
                    <div className="mob-fav-title">{property.propertyTitle}</div>
                    <div className="mob-fav-meta">
                      <span>{property.propertyCategory}</span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="mob-fav-empty">
              <img src="/img/icons/icoAlert.svg" alt="" />
              <span>{t('No Favorites found!')}</span>
            </div>
          )}
        </div>
        {myFavorites?.length > 0 && (
          <Stack className="pagination-config">
            <Stack className="pagination-box">
              <Pagination
                count={Math.ceil(total / searchFavorites.limit)}
                page={searchFavorites.page}
                shape="circular"
                color="primary"
                onChange={paginationHandler}
              />
            </Stack>
            <Stack className="total-result">
              <Typography>
                {t('Total {{total}} favorite {{property}}', { 
                  total, 
                  property: total > 1 ? t('properties') : t('property') 
                })}
              </Typography>
            </Stack>
          </Stack>
        )}
      </div>
    );
  } else {
    return (
      <div id="my-favorites-page">
        <Stack className="main-title-box">
          <Stack className="right-box">
            <Typography className="main-title">{t('My Favorites')}</Typography>
            <Typography className="sub-title">{t('We are glad to see you again!')}</Typography>
          </Stack>
        </Stack>
        <Stack className="favorites-list-box">
          {myFavorites?.length ? (
            myFavorites?.map((property: Property) => {
              return (
                <TrendPropertyCard
                  property={property}
                  likePropertyHandler={likePropertyHandler}
                  myFavorites={true}
                />
              );
            })
          ) : (
            <div
              className="no-data"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginLeft: '250px',
                marginTop: '58px',
              }}
            >
              <img src="/img/icons/icoAlert.svg" alt="" style={{ width: '60px', height: '60px' }} />
              <p style={{ fontSize: '18px', color: 'var(--text-2)', marginTop: '8px', marginLeft: '45px' }}>
                {t('No Favorites found!')}
              </p>
            </div>
          )}
        </Stack>
        {myFavorites?.length ? (
          <Stack className="pagination-config">
            <Stack className="pagination-box">
              <Pagination
                count={Math.ceil(total / searchFavorites.limit)}
                page={searchFavorites.page}
                shape="circular"
                color="primary"
                onChange={paginationHandler}
              />
            </Stack>
            <Stack className="total-result">
              <Typography>
                {t('Total {{total}} favorite {{property}}', { 
                  total, 
                  property: total > 1 ? t('properties') : t('property') 
                })}
              </Typography>
            </Stack>
          </Stack>
        ) : null}
      </div>
    );
  }
};

export default MyFavorites;