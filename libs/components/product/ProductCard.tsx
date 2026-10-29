import React, { useState } from 'react';
import { uploadImageUrl, MEDIUM_IMAGE_WIDTH } from '../../utils/imageUrl';
import StarRating from '../common/StarRating';
import { Stack, Box, Typography } from '@mui/material';
import Link from 'next/link';
import IconButton from '@mui/material/IconButton';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import CheckIcon from '@mui/icons-material/Check';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { formatterStr, formatCount } from '../../utils';
import { useReactiveVar } from '@apollo/client';
import { compareVar, userVar } from '../../../apollo/store';
import { addToCart } from '../../utils/cartUtils';
import { COMPARE_MAX, toggleCompare } from '../../utils/compareUtils';
import { sweetMixinErrorAlert } from '../../sweetAlert';
import { flyToCart } from '../../utils/flyToCart';
import { Product } from '../../types/product/product';
import { useTranslation } from 'next-i18next';
import { getLocalizedTitle } from '../../utils/localizeProduct';
import { useCurrency } from '../../context/CurrencyContext';
import { activeSalePrice } from '../../utils/sale';
import { getStockInfo } from '../../utils/stock';

interface ProductCardProps {
	product: Product;
	likeProductHandler?: any;
	myFavorites?: boolean;
	recentlyVisited?: boolean;
}

const ProductCard = (props: ProductCardProps) => {
	const { product, likeProductHandler, myFavorites, recentlyVisited } = props;
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const { t, i18n } = useTranslation('common');
	const { formatPrice } = useCurrency();
	const title = getLocalizedTitle(product, i18n.language);
	const imagePath: string = product?.productImages?.[0]
		? uploadImageUrl(product.productImages[0], MEDIUM_IMAGE_WIDTH)
		: '/img/banner/header1.jpg';

	const [isHovered, setIsHovered] = useState(false);
	const [addedFlash, setAddedFlash] = useState(false);
	const compareIds = useReactiveVar(compareVar);
	const inCompare = !!product?._id && compareIds.includes(product._id);

	const handleCompare = async (e: React.SyntheticEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (!product?._id) return;
		if (!toggleCompare(product._id)) {
			await sweetMixinErrorAlert(t('You can compare up to {{count}} products', { count: COMPARE_MAX }));
		}
	};

	const hoverImagePath: string =
		isHovered && product?.productImages?.[1]
			? uploadImageUrl(product.productImages[1], MEDIUM_IMAGE_WIDTH)
			: imagePath;

	// Chegirma faqat sale oynasi ochiq bo'lgandagina ko'rsatiladi
	const salePrice = activeSalePrice(product);
	const discountPercent =
		product?.productPrice && salePrice
			? Math.round(((product.productPrice - salePrice) / product.productPrice) * 100)
			: 0;

	// Tugagan: eski boolean (productInStock===false) YOKI numeric productStock<=0
	const stockInfo = getStockInfo(product?.productStock);
	const isOutOfStock = product?.productInStock === false || !!stockInfo?.soldOut;
	const isLowStock = !isOutOfStock && !!stockInfo?.low;

	const handleAddToCart = (e: React.MouseEvent | React.KeyboardEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (isOutOfStock) return;
		addToCart({
			_id: product?._id,
			productTitle: title,
			productPrice: product?.productPrice,
			productSalePrice: salePrice,
			productImages: product?.productImages,
			productType: product?.productType,
			memberNick: product?.memberData?.memberNick,
		});
		setAddedFlash(true);
		setTimeout(() => setAddedFlash(false), 2000);
		flyToCart(e.currentTarget as HTMLElement, imagePath);
	};

	if (device === 'mobile') {
		return (
			<Stack className={`mob-product-card${isOutOfStock ? ' is-sold-out' : ''}`}>
				<Link href={{ pathname: '/products/detail', query: { id: product?._id } }} className="mob-card-img-wrap">
					<img loading="lazy" decoding="async" src={imagePath} alt={title || 'Product'} className="mob-card-img" />
					{discountPercent > 0 && <span className="mob-sale-badge">-{discountPercent}%</span>}
					<span className="mob-cat-badge">{t(product?.productCategory)}</span>
					{isOutOfStock && <span className="soldOutBadge">{t('sold_out')}</span>}
					{isLowStock && <span className="lowStockBadge">{t("Only {{count}} left", { count: stockInfo?.count })}</span>}
				</Link>

				<Stack className="mob-card-info">
					{/* Rating + sold */}
					<div className="mob-card-rating">
						<StarRating value={product?.productRating || 0} size={12} />
						{product?.productRating ? (
							<span className="mob-card-rating-val">{product.productRating.toFixed(1)}</span>
						) : null}
						{product?.productSoldCount ? (
							<span className="mob-card-sold">{formatCount(product.productSoldCount)}+ sold</span>
						) : null}
					</div>

					<Link href={{ pathname: '/products/detail', query: { id: product?._id } }}>
						<Typography className="mob-card-title">{title}</Typography>
					</Link>

					<Stack className="mob-card-price">
						{discountPercent > 0 ? (
							<>
								<Typography className="mob-new-price">{formatPrice(salePrice)}</Typography>
								<Typography className="mob-old-price">{formatPrice(product?.productPrice)}</Typography>
							</>
						) : (
							<Typography className="mob-cur-price">{formatPrice(product?.productPrice)}</Typography>
						)}
					</Stack>

					{!recentlyVisited && (
						<div className="mob-card-actions">
							<div className="mob-action">
								<RemoveRedEyeIcon sx={{ fontSize: 13 }} />
								{formatCount(product?.productViews)}
							</div>
							<div className="mob-action">
								<RateReviewOutlinedIcon sx={{ fontSize: 13 }} />
								{product?.productReviews || 0}
							</div>
							<div
								className="mob-action"
								role="button"
								tabIndex={0}
								aria-label={t('Like')}
								onClick={(e) => { e.preventDefault(); likeProductHandler?.(user, product?._id); }}
								onKeyDown={(e) => {
									if (e.key === 'Enter' || e.key === ' ') {
										e.preventDefault();
										likeProductHandler?.(user, product?._id);
									}
								}}
							>
								{myFavorites || product?.meLiked?.[0]?.myFavorite
									? <FavoriteIcon style={{ fontSize: 13, color: 'var(--primary)' }} />
									: <FavoriteBorderIcon style={{ fontSize: 13, color: 'var(--text-4)' }} />}
								{formatCount(product?.productLikes)}
							</div>
							<div
								className={`mob-action${inCompare ? ' mob-action-compare-on' : ''}`}
								role="button"
								tabIndex={0}
								aria-pressed={inCompare}
								aria-label={t('Compare')}
								onClick={handleCompare}
								onKeyDown={(e) => {
									if (e.key === 'Enter' || e.key === ' ') handleCompare(e);
								}}
							>
								<CompareArrowsIcon sx={{ fontSize: 13, color: inCompare ? 'var(--primary)' : 'var(--text-4)' }} />
							</div>
							<div
								className={`mob-action mob-action-cart ${addedFlash ? 'added' : ''}${isOutOfStock ? ' disabled' : ''}`}
								role="button"
								tabIndex={isOutOfStock ? -1 : 0}
								aria-disabled={isOutOfStock}
								aria-label={t('Add to Cart')}
								onClick={handleAddToCart}
								onKeyDown={(e) => {
									if (e.key === 'Enter' || e.key === ' ') {
										e.preventDefault();
										handleAddToCart(e);
									}
								}}
							>
								<AddShoppingCartIcon sx={{ fontSize: 13, color: 'var(--primary)' }} />
								<span className="mob-action-label">{t('Add to Cart')}</span>
							</div>
						</div>
					)}
				</Stack>
			</Stack>
		);
	}

	// ── PC ──
	return (
		<Stack
			className={`card-config${isOutOfStock ? ' is-sold-out' : ''}`}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
		>
			<Stack className="top">
				<Link href={{ pathname: '/products/detail', query: { id: product?._id } }}>
					<img loading="lazy" decoding="async" src={hoverImagePath} alt={title || 'Product'} style={{ transition: 'opacity 0.3s' }} />
				</Link>

				{discountPercent > 0 && (
					<Box component="div" className="sale-badge">
						<Typography>-{discountPercent}%</Typography>
					</Box>
				)}

				<Box component="div" className="category-badge">
					<Typography>{t(product?.productCategory)}</Typography>
				</Box>

				{isOutOfStock && <span className="soldOutBadge">{t('sold_out')}</span>}
					{isLowStock && <span className="lowStockBadge">{t("Only {{count}} left", { count: stockInfo?.count })}</span>}
			</Stack>

			<Stack className="bottom">
				{/* Rating + sold count */}
				<div className="pc-card-rating">
					<StarRating value={product?.productRating || 0} size={13} />
					{product?.productRating ? (
						<span className="pc-card-rating-val">{product.productRating.toFixed(1)}</span>
					) : null}
					{product?.productSoldCount ? (
						<span className="pc-card-sold">{formatCount(product.productSoldCount)}+ sold</span>
					) : null}
				</div>

				<Stack className="title-section">
					<Link href={{ pathname: '/products/detail', query: { id: product?._id } }}>
						<Typography className="furniture-title">{title}</Typography>
					</Link>
				</Stack>

				<Stack className="price-section">
					{discountPercent > 0 ? (
						<Box component="div" className="price-container">
							<Typography className="new-price">{formatPrice(salePrice)}</Typography>
							<Typography className="old-price">{formatPrice(product?.productPrice)}</Typography>
						</Box>
					) : (
						<Typography className="current-price">{formatPrice(product?.productPrice)}</Typography>
					)}
				</Stack>

				{!recentlyVisited && (
					<button
						className={`pc-card-cart-btn ${addedFlash ? 'added' : ''}`}
						onClick={handleAddToCart}
						disabled={isOutOfStock}
					>
						<AddShoppingCartIcon sx={{ fontSize: 15 }} />{' '}
						{t('Add to Cart')}
					</button>
				)}

				<Stack className="details">
					<Box component="div" className="detail-item">
						<Typography>{t(product?.productType)}</Typography>
					</Box>
					<Box component="div" className="detail-item">
						<Typography>{t(product?.productMaterial)}</Typography>
					</Box>
					<Box component="div" className="detail-item">
						<Typography>{t(product?.productCondition)}</Typography>
					</Box>
					<Box component="div" className="detail-item color-item">
						<Box
							component="div"
							className="color-indicator"
							style={{ backgroundColor: product?.productColor?.toLowerCase() || '#ccc' }}
						/>
						<Typography>{t(product?.productColor)}</Typography>
					</Box>
				</Stack>

				<Stack className="divider" />

				{!recentlyVisited && (
					<Stack className="action-buttons">
						<Box component="div" className="action-item">
							<IconButton size="small">
								<RemoveRedEyeIcon />
							</IconButton>
							<Typography>{formatCount(product?.productViews)}</Typography>
						</Box>
						<Box component="div" className="action-item">
							<IconButton size="small">
								<RateReviewOutlinedIcon />
							</IconButton>
							<Typography>{product?.productReviews || 0}</Typography>
						</Box>
						<Box component="div" className="action-item">
							<IconButton size="small" onClick={() => likeProductHandler?.(user, product?._id)}>
								{myFavorites || product?.meLiked?.[0]?.myFavorite ? (
									<FavoriteIcon style={{ color: 'var(--primary)' }} />
								) : (
									<FavoriteBorderIcon style={{ color: 'var(--text-4)' }} />
								)}
							</IconButton>
							<Typography>{formatCount(product?.productLikes)}</Typography>
						</Box>
						<Box component="div" className="action-item">
							<IconButton size="small" onClick={handleCompare} aria-pressed={inCompare} aria-label={t('Compare')} title={t('Compare')}>
								<CompareArrowsIcon style={{ color: inCompare ? 'var(--primary)' : 'var(--text-4)' }} />
							</IconButton>
						</Box>
					</Stack>
				)}
			</Stack>
		</Stack>
	);
};

export default ProductCard;
