import React, { useState } from 'react';
import { uploadImageUrl, MEDIUM_IMAGE_WIDTH } from '../../utils/imageUrl';
import { Box, Stack, Typography, IconButton } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import CheckIcon from '@mui/icons-material/Check';
import { useRouter } from 'next/router';
import { Product } from '../../types/product/product';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { useTranslation } from 'next-i18next';
import { formatCount } from '../../utils';
import { addToCart } from '../../utils/cartUtils';
import { flyToCart } from '../../utils/flyToCart';
import { useCurrency } from '../../context/CurrencyContext';
import { getLocalizedTitle } from '../../utils/localizeProduct';
import { activeSalePrice } from '../../utils/sale';
import { CustomJwtPayload } from '../../types/customJwtPayload';

interface TrendProductCardProps {
	product: Product;
	likeProductHandler: (user: CustomJwtPayload, productId: string) => void;
	myFavorites?: boolean;
	recentlyVisited?: boolean;
}

const TrendProductCard = ({ product, likeProductHandler }: TrendProductCardProps) => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [isHovered, setIsHovered] = useState(false);
	const [addedFlash, setAddedFlash] = useState(false);
	const { t } = useTranslation('common');
	const { formatPrice } = useCurrency();

	const imagePath = product?.productImages?.[0]
		? uploadImageUrl(product.productImages[0], MEDIUM_IMAGE_WIDTH)
		: '/img/banner/header1.jpg';
	const title = getLocalizedTitle(product, router.locale);

	const pushDetailHandler = (id: string) => {
		router.push({ pathname: '/products/detail', query: { id } });
	};

	// Chegirma faqat sale oynasi ochiq bo'lgandagina qo'llanadi
	const salePrice = activeSalePrice(product);

	const handleAddToCart = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (product?.productInStock === false) return;
		addToCart({
			_id: product._id,
			productTitle: title,
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

	// Hover qilganda 2-chi rasm, aks holda 1-chi rasm
	const backgroundImage =
		isHovered && product?.productImages?.[1]
			? `url(${uploadImageUrl(product.productImages[1], MEDIUM_IMAGE_WIDTH)})`
			: `url(${uploadImageUrl(product.productImages?.[0], MEDIUM_IMAGE_WIDTH)})`;

	return (
		<Box
			className={`product-card${product?.productInStock === false ? ' is-sold-out' : ''}`}
			component="div"
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
		>
			<Box className="product-image-container" component="div" onClick={() => pushDetailHandler(product._id)}>
				<Box
					className="product-image"
					component="div"
					sx={{
						backgroundImage: backgroundImage,
						transition: 'background-image 0.3s ease-in-out',
					}}
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

				<IconButton
					className={`big-card-cart-btn ${addedFlash ? 'added' : ''}`}
					onClick={handleAddToCart}
				>
					<AddShoppingCartIcon sx={{ fontSize: 18 }} />
				</IconButton>
			</Box>

			<Box className="product-info-container" component="div">
				<Box className="title-views-container" component="div">
					<Typography className="product-title">{title}</Typography>
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
							{product?.meLiked?.[0]?.myFavorite ? (
								<FavoriteIcon style={{ color: 'red' }} />
							) : (
								<FavoriteBorderIcon style={{ color: 'var(--text-4)' }} />
							)}
						</IconButton>
						<Typography className="likes-count">{formatCount(product?.productLikes)}</Typography>
					</Box>
				</Box>
			</Box>
		</Box>
	);
};

export default TrendProductCard;
