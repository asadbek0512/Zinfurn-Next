import { Menu, MenuItem, Stack, Typography } from '@mui/material';
import React, { useState } from 'react';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import IconButton from '@mui/material/IconButton';
import ModeIcon from '@mui/icons-material/Mode';
import DeleteIcon from '@mui/icons-material/Delete';
import { Product } from '../../types/product/product';
import { formatterStr } from '../../utils';
import Moment from 'react-moment';
import { useRouter } from 'next/router';
import { ProductStatus } from '../../enums/product.enum';
import { useTranslation } from 'next-i18next';
import { useCurrency } from '../../context/CurrencyContext';

interface ProductCardProps {
  product: Product;
  deleteProductHandler?: any;
  memberPage?: boolean;
  updateProductHandler?: any;
  toggleStockHandler?: any;
}

export const ProductCard = (props: ProductCardProps) => {
  const { t } = useTranslation('common');
  const { formatPrice } = useCurrency();
  const { product, deleteProductHandler, memberPage, updateProductHandler, toggleStockHandler } = props;
  const device = useDeviceDetect();
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  // productInStock aniq `false` bo'lsagina tugagan deb hisoblanadi (undefined = sotuvda bor)
  const isInStock = product?.productInStock !== false;

  /** HANDLERS **/
  const pushEditProduct = async (id: string) => {
    await router.push({
      pathname: '/mypage',
      query: { category: 'addProduct', productId: id },
    });
  };

  const pushProductDetail = async (id: string) => {
    if (memberPage)
      await router.push({
        pathname: '/products/detail',
        query: { id: id },
      });
    else return;
  };

  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  if (device === 'mobile') {
    const imgSrc = product.productImages?.[0]
      ? `${process.env.REACT_APP_API_URL}/${product.productImages[0]}`
      : '/img/banner/Home-1-.jpg';
    const isSold = product.productStatus === ProductStatus.SOLD;

    return (
      <div className="mob-myprop-card">
        <img className="mob-myprop-card-img" src={imgSrc} alt="" loading="lazy" decoding="async" />
        <div className="mob-myprop-card-body">
          <div className="mob-myprop-card-title">{product.productTitle}</div>
          <div className="mob-myprop-card-date">
            <Moment format="DD MMM, YYYY">{product.createdAt}</Moment>
          </div>
          <div className={`mob-myprop-card-status${isSold ? ' sold' : ''}`}>
            {t(product.productStatus?.toString() || '')}
          </div>
          {!memberPage && (
            <div className="mob-myprop-card-actions">
              {!isSold && (
                <button className="edit" onClick={() => pushEditProduct(product._id)}>
                  {t('Edit')}
                </button>
              )}
              {!isSold && (
                <button
                  className={`stock-toggle${isInStock ? '' : ' off'}`}
                  onClick={() => toggleStockHandler?.(!isInStock, product._id)}
                >
                  {isInStock ? t('mark_sold_out') : t('mark_in_stock')}
                </button>
              )}
              <button className="delete" onClick={() => deleteProductHandler?.(product._id)}>
                {t('Delete')}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  } else
    return (
      <Stack className="product-card-box">
        <Stack className="image-box" onClick={() => pushProductDetail(product?._id)}>
          <img src={`${process.env.REACT_APP_API_URL}/${product.productImages?.[0]}`} alt="" loading="lazy" decoding="async" />
        </Stack>
        <Stack className="information-box" onClick={() => pushProductDetail(product?._id)}>
          <Typography className="name">{product.productTitle}</Typography>
          <Typography className="address">{product.productAddress}</Typography>
          <Typography className="price">
            <strong>{formatPrice(product?.productPrice)}</strong>
          </Typography>
        </Stack>
        <Stack className="date-box">
          <Typography className="date">
            <Moment format="DD MMMM, YYYY">{product.createdAt}</Moment>
          </Typography>
        </Stack>
        <Stack className="status-box">
          <Stack className="coloured-box" sx={{ background: '#E5F0FD' }} onClick={handleClick}>
            <Typography className="status" sx={{ color: '#3554d1' }}>
						{t(product.productStatus?.toString() || '')}
            </Typography>
          </Stack>
        </Stack>
        {!memberPage && product.productStatus !== 'SOLD' && (
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            PaperProps={{
              elevation: 0,
              sx: {
                width: '70px',
                mt: 1,
                ml: '10px',
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
              },
              style: {
                padding: 0,
                display: 'flex',
                justifyContent: 'center',
              },
            }}
          >
            {product.productStatus === 'ACTIVE' && (
              <>
                <MenuItem
                  disableRipple
                  onClick={() => {
                    handleClose();
                    updateProductHandler(ProductStatus.SOLD, product?._id);
                  }}
                >
                  {t('Sold')}
                </MenuItem>
              </>
            )}
          </Menu>
        )}

        <Stack className="views-box">
          <Typography className="views">{product.productViews.toLocaleString()}</Typography>
        </Stack>
        {!memberPage && product.productStatus == ProductStatus.ACTIVE && (
          <Stack className="action-box">
            <IconButton className="icon-button" onClick={() => pushEditProduct(product._id)}>
              <ModeIcon className="buttons" />
            </IconButton>
            <IconButton className="icon-button" onClick={() => deleteProductHandler(product._id)}>
              <DeleteIcon className="buttons" />
            </IconButton>
            <button
              className={`stock-toggle-btn${isInStock ? '' : ' off'}`}
              onClick={() => toggleStockHandler?.(!isInStock, product._id)}
              title={isInStock ? t('mark_sold_out') : t('mark_in_stock')}
            >
              {isInStock ? t('in_stock') : t('sold_out')}
            </button>
          </Stack>
        )}
      </Stack>
    );
};