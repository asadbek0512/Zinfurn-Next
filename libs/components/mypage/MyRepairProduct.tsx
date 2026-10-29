import React, { useState } from 'react';
import { NextPage } from 'next';
import { Pagination, Stack, Typography, Card, CardContent, CardMedia, Box, Chip } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { useQuery, useReactiveVar } from '@apollo/client';
import { T } from '../../types/common';
import { userVar } from '../../../apollo/store';
import { useRouter } from 'next/router';
import { GET_TECHNICIAN_PRODUCTS } from '../../../apollo/user/mutation';
import { RepairProductsInquiry } from '../../types/repairProduct/repairProduct.input';
import { RepairProduct } from '../../types/repairProduct/repairProduct';
import { RepairProductStatus } from '../../enums/repairProduct.enum';
import { useTranslation } from 'next-i18next';
import { getLocalizedRepairText } from '../../utils/localizeRepair';

const MyRepairProduct: NextPage = ({ initialInput, ...props }: any) => {
  const { t } = useTranslation('common');
  const device = useDeviceDetect();
  const [searchFilter, setSearchFilter] = useState<RepairProductsInquiry>(initialInput);
  const [technicianRepairProducts, setTechnicianRepairProducts] = useState<RepairProduct[]>([]);
  const [total, setTotal] = useState<number>(0);
  const user = useReactiveVar(userVar);
  const router = useRouter();

  /** APOLLO REQUESTS **/
  const {
    loading: getTechnicianRepairProductsLoading,
    data: getTechnicianRepairProductsData,
    error: getTechnicianRepairProductsError,
    refetch: getTechnicianRepairProductsRefetch,
  } = useQuery(GET_TECHNICIAN_PRODUCTS, {
    fetchPolicy: 'network-only',
    variables: { input: searchFilter },
    notifyOnNetworkStatusChange: true,
    onCompleted: (data) => {
      setTechnicianRepairProducts(data?.getTechnicianProducts?.list);
      setTotal(data?.getTechnicianProducts?.metaCounter[0]?.total ?? 0);
    },
  });

  /** HANDLERS **/
  const paginationHandler = (e: T, value: number) => {
    setSearchFilter({ ...searchFilter, page: value });
  };

  const changeStatusHandler = (value: RepairProductStatus) => {
    setSearchFilter({ ...searchFilter, search: { repairProductStatus: value } });
  };

  if (user?.memberType !== 'TECHNICIAN') {
    router.back();
  }

  if (device === 'mobile') {
    return (
      <div id="mob-myrepair">
        <div className="mob-myrepair-header">
          <h2>{t('My Repair Products')}</h2>
          <span>{t('We are glad to see you again!')}</span>
        </div>
        <div className="mob-myrepair-list">
          {technicianRepairProducts?.length === 0 ? (
            <div className="mob-myrepair-empty">
              <img src="/img/icons/icoAlert.svg" alt="" loading="lazy" decoding="async" />
              <span>{t('No Repair Product found!')}</span>
            </div>
          ) : (
            technicianRepairProducts?.map((repairProduct: RepairProduct) => (
              <div key={repairProduct._id} className="mob-myrepair-card">
                <img
                  src={
                    repairProduct.repairProductImages?.length
                      ? `${process.env.REACT_APP_API_URL}/${repairProduct.repairProductImages[0]}`
                      : '/img/banner/Home-1-.jpg'
                  }
                  alt="" loading="lazy" decoding="async" />
                <div className="mob-myrepair-card-body">
                  <div className="mob-myrepair-type">{t(repairProduct.repairProductType)}</div>
                  <div className="mob-myrepair-address">{repairProduct.repairProductAddress}</div>
                  <div className="mob-myrepair-desc">{getLocalizedRepairText(repairProduct, router.locale)}</div>
                  <div className="mob-myrepair-status">{t('ACTIVE')}</div>
                </div>
              </div>
            ))
          )}
        </div>
        {technicianRepairProducts?.length > 0 && (
          <Stack className="pagination-config">
            <Stack className="pagination-box">
              <Pagination
                count={Math.ceil(total / searchFilter.limit)}
                page={searchFilter.page}
                shape="circular"
                color="primary"
                onChange={paginationHandler}
              />
            </Stack>
            <Stack className="total-result">
              <Typography>{t('{{total}} product available', { total })}</Typography>
            </Stack>
          </Stack>
        )}
      </div>
    );
  } else {
    return (
      <div id="my-product-page">
        <Stack className="main-title-box">
          <Stack className="right-box">
            <Typography className="main-title">{t('My Repair Products')}</Typography>
            <Typography className="sub-title">{t('We are glad to see you again!')}</Typography>
          </Stack>
        </Stack>

        <Stack className="product-list-box" sx={{ mt: -4 }}>
          <Stack className="list-box">
            {technicianRepairProducts?.length === 0 ? (
              <div className={'no-data'}>
                <img src="/img/icons/icoAlert.svg" alt="" loading="lazy" decoding="async" />
                <p>{t('No Repair Product found!')}</p>
              </div>
            ) : (
              <Stack spacing={3}>
                {technicianRepairProducts?.map((repairProduct: RepairProduct) => (
                  <Card
                    key={repairProduct._id}
                    sx={{
                      display: 'flex',
                      minHeight: 200,
                      boxShadow: 2,
                      borderRadius: 2,
                    }}
                  >
                    <CardMedia
                      component="img"
                      sx={{
                        width: 300,
                        height: 200,
                        objectFit: 'cover',
                      }}
                      image={
                        repairProduct.repairProductImages && repairProduct.repairProductImages.length > 0
                          ? `${process.env.REACT_APP_API_URL}/${repairProduct.repairProductImages[0]}`
                          : '/img/default-product.jpg'
                      }
                      alt={repairProduct.repairProductType}
                    />
                    <Box component={'div'} sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <CardContent sx={{ flex: '1 0 auto', padding: 3 }}>
                        <Box
                          component={'div'}
                          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}
                        >
                          <Typography
                            component="h2"
                            variant="h5"
                            sx={{
                              fontWeight: 'bold',
                              color: '#2C3E50',
                              mb: 1,
                            }}
                          >
                            {t(repairProduct.repairProductType)}
                          </Typography>
                          <Chip
                            label={t('ACTIVE')}
                            size="small"
                            sx={{
                              fontWeight: 'bold',
                              fontSize: '0.75rem',
                              backgroundColor: 'var(--primary)',
                              color: 'white',
                            }}
                          />
                        </Box>

                        <Typography
                          variant="body1"
                          color="text.secondary"
                          sx={{
                            mb: 2,
                            display: 'flex',
                            alignItems: 'center',
                            fontWeight: '500',
                          }}
                        >
                          <Box
                            component="span"
                            sx={{
                              display: 'inline-block',
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              backgroundColor: '#E74C3C',
                              mr: 1,
                            }}
                          />
                          {repairProduct.repairProductAddress}
                        </Typography>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            lineHeight: 1.6,
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {getLocalizedRepairText(repairProduct, router.locale)}
                        </Typography>
                      </CardContent>
                    </Box>
                  </Card>
                ))}
              </Stack>
            )}

            {technicianRepairProducts?.length !== 0 && (
              <Stack className="pagination-config">
                <Stack className="pagination-box">
                  <Pagination
                    count={Math.ceil(total / searchFilter.limit)}
                    page={searchFilter.page}
                    shape="circular"
                    color="primary"
                    onChange={paginationHandler}
                  />
                </Stack>
                <Stack className="total-result">
                  <Typography>{t('{{total}} product available', { total })}</Typography>
                </Stack>
              </Stack>
            )}
          </Stack>
        </Stack>
      </div>
    );
  }
};

MyRepairProduct.defaultProps = {
  initialInput: {
    page: 1,
    limit: 3,
    sort: 'createdAt',
    search: {
      repairProductStatus: 'ACTIVE',
    },
  },
};

export default MyRepairProduct;