import React, { useState } from 'react';
import { NextPage } from 'next';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Pagination, Stack, Typography } from '@mui/material';
import ProductCard from '../product/ProductCard';
import { Product } from '../../types/product/product';
import { T, getErrorMessage } from '../../types/common';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { GET_VISITED } from '../../../apollo/user/query';
import TrendProductCard from '../homepage/TrendProductCard';
import { Messages, REACT_APP_API_URL } from '../../config';
import { LIKE_TARGET_PRODUCT } from '../../../apollo/user/mutation';
import { sweetMixinErrorAlert } from '../../sweetAlert';
import { useTranslation } from 'next-i18next';
import { useCurrency } from '../../context/CurrencyContext';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useRouter } from 'next/router';
import { userVar } from '../../../apollo/store';
import { CustomJwtPayload } from '../../types/customJwtPayload';
import ProductCardSkeleton from '../common/ProductCardSkeleton';

const RecentlyVisited: NextPage = () => {
  const { t } = useTranslation('common');
  const { formatPrice } = useCurrency();
  const device = useDeviceDetect();
  const router = useRouter();
  const user = useReactiveVar(userVar);
  const [recentlyVisited, setRecentlyVisited] = useState<Product[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [searchVisited, setSearchVisited] = useState<T>({ page: 1, limit: 6 });

  /** APOLLO REQUESTS **/
  const [likeTargetProduct] = useMutation(LIKE_TARGET_PRODUCT);

  const {
    loading: getVisitedLoading,
    data: getVisitedData,
    error: getVisitedError,
    refetch: getVisitedRefetch,
  } = useQuery(GET_VISITED, {
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
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

  const likeProductHandler = async (user: CustomJwtPayload, id: string) => {
    try {
      if (!id) return;
      if (!user?._id) throw new Error(Messages.error2);

      await likeTargetProduct({
        variables: {
          input: id,
        },
      });

      await getVisitedRefetch({ input: searchVisited });
    } catch (err: unknown) {
      console.error('ERROR, likeProductHandler:', getErrorMessage(err));
      await sweetMixinErrorAlert(getErrorMessage(err)).then();
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
            recentlyVisited.map((product: Product) => {
              const imgSrc = product.productImages?.[0]
                ? `${REACT_APP_API_URL}/${product.productImages[0]}`
                : '/img/banner/Home-1-.jpg';
              const isLiked = product.meLiked?.[0]?.myFavorite;
              return (
                <div
                  key={product._id}
                  className="mob-fav-card"
                  onClick={() => router.push({ pathname: '/products/detail', query: { id: product._id } })}
                >
                  <div className="mob-fav-card-img-wrap">
                    <img src={imgSrc} alt="" loading="lazy" decoding="async" />
                    {product.productPrice && (
                      <div className="mob-fav-badge">{formatPrice(product.productPrice)}</div>
                    )}
                    <div
                      className="mob-fav-like-btn"
                      onClick={(e) => { e.stopPropagation(); likeProductHandler(user, product._id); }}
                    >
                      {isLiked
                        ? <FavoriteIcon sx={{ fontSize: 18, color: 'var(--primary)' }} />
                        : <FavoriteBorderIcon sx={{ fontSize: 18, color: 'var(--text-4)' }} />
                      }
                    </div>
                  </div>
                  <div className="mob-fav-card-body">
                    <div className="mob-fav-title">{product.productTitle}</div>
                    <div className="mob-fav-meta">
                      <span>{product.productCategory}</span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : getVisitedLoading ? (
            Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)
          ) : (
            <div className="mob-fav-empty">
              <img src="/img/icons/icoAlert.svg" alt="" loading="lazy" decoding="async" />
              <span>{t('No Visited Products found!')}</span>
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
                {t('Total {{total}} recently visited {{product}}', { 
                  total, 
                  product: total > 1 ? t('products') : t('product') 
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
            recentlyVisited?.map((product: Product) => {
              return <TrendProductCard product={product} likeProductHandler={likeProductHandler} recentlyVisited={true} />;
            })
          ) : getVisitedLoading ? (
            Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)
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
                {t('No Visited Products found!')}
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
                {t('Total {{total}} recently visited {{product}}', { 
                  total, 
                  product: total > 1 ? t('products') : t('product') 
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