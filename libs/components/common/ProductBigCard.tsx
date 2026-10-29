import React, { useState } from 'react';
import { Stack, Box, Divider, Typography } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import FavoriteIcon from '@mui/icons-material/Favorite';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import CheckIcon from '@mui/icons-material/Check';
import { Product } from '../../types/product/product';
import { REACT_APP_API_URL } from '../../config';
import { formatterStr, formatCount } from '../../utils';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { useRouter } from 'next/router';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { useTranslation } from 'next-i18next';
import { useCurrency } from '../../context/CurrencyContext';
import { addToCart } from '../../utils/cartUtils';
import { flyToCart } from '../../utils/flyToCart';
import { activeSalePrice } from '../../utils/sale';

interface ProductBigCardProps {
	product: Product;
	likeProductHandler?: any;
  myFavorites?: boolean;
}

const ProductBigCard = (props: ProductBigCardProps) => {
	const { product, likeProductHandler } = props;
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const router = useRouter();
	const { t } = useTranslation('common');
	const { formatPrice } = useCurrency();
	const [addedFlash, setAddedFlash] = useState(false);

	const imagePath = product?.productImages?.[0]
		? `${REACT_APP_API_URL}/${product.productImages[0]}`
		: '/img/banner/header1.jpg';

	/** HANDLERS **/
	const goProductDetatilPage = (productId: string) => {
		router.push(`/products/detail?id=${productId}`);
	};

	// Chegirma faqat sale oynasi ochiq bo'lgandagina qo'llanadi
	const salePrice = activeSalePrice(product);

	const handleAddToCart = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (product?.productInStock === false) return;
		addToCart({
			_id: product._id,
			productTitle: product.productTitle,
			productPrice: product.productPrice,
			productSalePrice: salePrice,
			productImages: product.productImages,
			productType: product.productType,
		});
		setAddedFlash(true);
		setTimeout(() => setAddedFlash(false), 2000);
		flyToCart(e.currentTarget as HTMLElement, imagePath);
	};

	const discountPercent =
		product.productPrice && salePrice
			? Math.round(((product.productPrice - salePrice) / product.productPrice) * 100)
			: 0;

	if (device === 'mobile') {
		return (
			<Box
				className={`mob-big-card${product?.productInStock === false ? ' is-sold-out' : ''}`}
				component="div"
				onClick={() => goProductDetatilPage(product._id)}
			>
				<Box className="mob-big-card-img-wrap" component="div">
					{product?.productInStock === false && <span className="soldOutBadge">{t('sold_out')}</span>}
					<Box
						className="mob-big-card-img"
						component="div"
						sx={{ backgroundImage: `url(${REACT_APP_API_URL}/${product.productImages?.[0]})` }}
					/>
					{discountPercent > 0 && (
						<span className="mob-big-card-sale">-{discountPercent}%</span>
					)}
					<span className="mob-big-card-cat">{t(product.productCategory)}</span>
				</Box>
				<Box className="mob-big-card-info" component="div">
					<Typography className="mob-big-card-title">{product.productTitle}</Typography>
					<Box className="mob-big-card-bottom" component="div">
						<Box className="mob-big-card-price" component="div">
							{salePrice ? (
								<>
									<Typography className="mob-big-card-orig-price">{formatPrice(product.productPrice)}</Typography>
									<Typography className="mob-big-card-sale-price">{formatPrice(salePrice)}</Typography>
								</>
							) : (
								<Typography className="mob-big-card-sale-price">{formatPrice(product.productPrice)}</Typography>
							)}
						</Box>
						<IconButton
							size="small"
							className="mob-big-card-like"
							onClick={(e) => { e.stopPropagation(); likeProductHandler?.(user, product._id); }}
						>
							<FavoriteIcon style={{ fontSize: 16, color: product?.meLiked?.[0]?.myFavorite ? 'red' : '#ccc' }} />
						</IconButton>
					</Box>
				</Box>
			</Box>
		);
	} else {
		return (
			<Box
				className={`product-card${product?.productInStock === false ? ' is-sold-out' : ''}`}
				component="div"
			>
				<Box className="product-image-container" component="div" onClick={() => goProductDetatilPage(product._id)}>
					<Box
						className="product-image"
						component="div"
						sx={{ backgroundImage: `url(${imagePath})` }}
					/>

					{product?.productInStock === false && <span className="soldOutBadge">{t('sold_out')}</span>}

					<Box className="top-badges" component="div">
						{discountPercent > 0 && (
							<Box className="discount-badge" component="div">
								<Typography className="discount-text">-{discountPercent}%</Typography>
							</Box>
						)}
						<Box className="category-badge" component="div">
							<Typography className="category-text">{t(product.productCategory)}</Typography>
						</Box>
					</Box>

					{/* Hover cart button — pastki o'ng burchak */}
					<IconButton
						className={`big-card-cart-btn ${addedFlash ? 'added' : ''}`}
						onClick={handleAddToCart}
					>
						<AddShoppingCartIcon sx={{ fontSize: 18 }} />
					</IconButton>
				</Box>

				<Box className="product-info-container" component="div">
					<Box className="title-views-container" component="div">
						<Typography className="product-title">{product.productTitle}</Typography>
					</Box>

					<Box className="price-like-container" component="div">
						<Box className="price-container" component="div">
							{salePrice ? (
								<>
									<Typography className="original-price">{formatPrice(product.productPrice)}</Typography>
									<Typography className="discounted-price">{formatPrice(salePrice)}</Typography>
								</>
							) : (
								<Typography className="discounted-price">{formatPrice(product.productPrice)}</Typography>
							)}
						</Box>

						<Box className="likes-container" component="div">
							<IconButton
								className="like-button"
								onClick={(e) => {
									e.stopPropagation();
									likeProductHandler(user, product._id);
								}}
							>
								<FavoriteIcon
									style={{
										color: product?.meLiked?.[0]?.myFavorite ? 'red' : '#41332d',
									}}
								/>
							</IconButton>
							<Typography className="likes-count">{formatCount(product?.productLikes)}</Typography>
						</Box>
					</Box>
				</Box>
			</Box>
		);
	}
};

export default ProductBigCard;
