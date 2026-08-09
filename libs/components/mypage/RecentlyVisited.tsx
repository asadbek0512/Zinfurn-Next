import React, { useState } from 'react';
import { NextPage } from 'next';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Pagination, Stack, Typography } from '@mui/material';
import PropertyCard from '../property/PropertyCard';
import { Property } from '../../types/property/property';
import { T } from '../../types/common';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { GET_VISITED } from '../../../apollo/user/query';
import TrendPropertyCard from '../homepage/TrendPropertyCard';
import { Messages, REACT_APP_API_URL } from '../../config';
import { LIKE_TARGET_PROPERTY } from '../../../apollo/user/mutation';
import { sweetMixinErrorAlert } from '../../sweetAlert';
import { useTranslation } from 'next-i18next';
import { useCurrency } from '../../context/CurrencyContext';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useRouter } from 'next/router';
import { userVar } from '../../../apollo/store';

const RecentlyVisited: NextPage = () => {
  const { t } = useTranslation('common');
  const { formatPrice } = useCurrency();
  const device = useDeviceDetect();
  const router = useRouter();
  const user = useReactiveVar(userVar);
  const [recentlyVisited, setRecentlyVisited] = useState<Property[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [searchVisited, setSearchVisited] = useState<T>({ page: 1, limit: 6 });

  /** APOLLO REQUESTS **/
  const [likeTargetProperty] = useMutation(LIKE_TARGET_PROPERTY);

  const {
    loading: getVisitedLoading,
    data: getVisitedData,
    error: getVisitedError,
    refetch: getVisitedRefetch,
  } = useQuery(GET_VISITED, {
    fetchPolicy: 'network-only',
    variables: {
      input: searchVisited,
    },
    onCompleted(data) {
      setRecentlyVisited(data?.getVisited?.list);
      setTotal(data?.getVisited?.metaCounter?.[0]?.total || 0);
    },
  });
  
  /** HANDLERS **/
  const paginationHandler = (e: T, value: number) => {
    setSearchVisited({ ...searchVisited, page: value });
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

      await getVisitedRefetch({ input: searchVisited });
    } catch (err: any) {
      console.error('ERROR, likePropertyHandler:', err.message);
      await sweetMixinErrorAlert(err.message).then();
    }
  };

  if (device === 'mobile') {
    return (
      <div id="mob-myvisited">
        <div className="mob-fav-header">
          <h2>{t('Recently Visited')}</h2>
          <span>{t('We are glad to see you again!')}</span>
        </div>
        <div className="mob-fav-list">
          {recentlyVisited?.length ? (
            recentlyVisited.map((property: Property) => {
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
                    <img src={imgSrc} alt="" loading="lazy" decoding="async" />
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
              <img src="/img/icons/icoAlert.svg" alt="" loading="lazy" decoding="async" />
              <span>{t('No Visited Properties found!')}</span>
            </div>
          )}
        </div>
        {recentlyVisited?.length > 0 && (
          <Stack className="pagination-config">
            <Stack className="pagination-box">
              <Pagination
                count={Math.ceil(total / searchVisited.limit)}
                page={searchVisited.page}
                shape="circular"
                color="primary"
                onChange={paginationHandler}
              />
            </Stack>
            <Stack className="total-result">
              <Typography>
                {t('Total {{total}} recently visited {{property}}', { 
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
            <Typography className="main-title">{t('Recently Visited')}</Typography>
            <Typography className="sub-title">{t('We are glad to see you again!')}</Typography>
          </Stack>
        </Stack>
        <Stack className="favorites-list-box">
          {recentlyVisited?.length ? (
            recentlyVisited?.map((property: Property) => {
              return <TrendPropertyCard property={property} likePropertyHandler={likePropertyHandler} recentlyVisited={true} />;
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
              <img src="/img/icons/icoAlert.svg" alt="" style={{ width: '60px', height: '60px' }} loading="lazy" decoding="async" />
              <p style={{ fontSize: '18px', color: 'var(--text-2)', marginTop: '8px', marginLeft: '45px' }}>
                {t('No Visited Properties found!')}
              </p>
            </div>
          )}
        </Stack>
        {recentlyVisited?.length ? (
          <Stack className="pagination-config">
            <Stack className="pagination-box">
              <Pagination
                count={Math.ceil(total / searchVisited.limit)}
                page={searchVisited.page}
                shape="circular"
                color="primary"
                onChange={paginationHandler}
              />
            </Stack>
            <Stack className="total-result">
              <Typography>
                {t('Total {{total}} recently visited {{property}}', { 
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

export default RecentlyVisited;