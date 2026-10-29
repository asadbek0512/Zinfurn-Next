import React from 'react';
import { uploadImageUrl } from '../../utils/imageUrl';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useReactiveVar } from '@apollo/client';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { Product } from '../../types/product/product';
import { formatCount } from '../../utils';
import { useCurrency } from '../../context/CurrencyContext';
import { userVar } from '../../../apollo/store';
import { getLocalizedTitle } from '../../utils/localizeProduct';
import { activeSalePrice } from '../../utils/sale';
import { CustomJwtPayload } from '../../types/customJwtPayload';

interface MobileProductCardProps {
	product: Product;
	likeProductHandler: (user: CustomJwtPayload, productId: string) => void;
}

/**
 * Homepage mobil mahsulot kartochkasi — TrendProducts va TopProducts (va boshqalar)
 * uchun yagona manba. Narx (asl tepada, skidka pastida) + like bir joyda.
 */
const MobileProductCard = ({ product, likeProductHandler }: MobileProductCardProps) => {
	const router = useRouter();
	const { t } = useTranslation('common');
	const { formatPrice } = useCurrency();
	const user = useReactiveVar(userVar);

	// Chegirma faqat sale oynasi ochiq bo'lgandagina ko'rsatiladi
	const salePrice = activeSalePrice(product);
	const discountPercent =
		product.productPrice && salePrice
			? Math.round(((product.productPrice - salePrice) / product.productPrice) * 100)
			: 0;
	const imgUrl = uploadImageUrl(product.productImages?.[0]);
	const title = getLocalizedTitle(product, router.locale);

	return (
		<div
			style={{ background: 'var(--surface)', borderRadius: '12px', overflow: 'hidden', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
			onClick={() => router.push({ pathname: '/products/detail', query: { id: product._id } })}
		>
			<div style={{ position: 'relative', height: '170px', background: 'var(--surface)' }}>
				<img loading="lazy" decoding="async" src={imgUrl} alt={title} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '4px' }} />
				<div style={{ position: 'absolute', top: '8px', left: '8px', right: '8px', display: 'flex', justifyContent: 'space-between' }}>
					{discountPercent > 0 && (
						<span style={{ background: '#ff6b35', color: '#fff', fontSize: '10px', padding: '2px 6px', borderRadius: '4px' }}>-{discountPercent}%</span>
					)}
					<span style={{ background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: '10px', padding: '2px 6px', borderRadius: '4px', marginLeft: 'auto' }}>
						{t(product.productCategory)}
					</span>
				</div>
			</div>
			<div style={{ padding: '8px 10px' }}>
				<div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '6px' }}>
					{title}
				</div>
				<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '6px' }}>
					<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: 0 }}>
						{salePrice ? (
							<>
								<span style={{ fontSize: '11px', color: 'var(--text-4)', textDecoration: 'line-through' }}>{formatPrice(product.productPrice)}</span>
								<span style={{ fontSize: '14px', fontWeight: 700, color: '#ff6b35' }}>{formatPrice(salePrice)}</span>
							</>
						) : (
							<span style={{ fontSize: '14px', fontWeight: 700, color: '#ff6b35' }}>{formatPrice(product.productPrice)}</span>
						)}
					</div>
					<div
						style={{ display: 'flex', alignItems: 'center', gap: '2px', flexShrink: 0 }}
						onClick={(e) => {
							e.stopPropagation();
							likeProductHandler(user, product._id);
						}}
					>
						{product?.meLiked?.[0]?.myFavorite ? (
							<FavoriteIcon style={{ fontSize: '16px', color: 'red' }} />
						) : (
							<FavoriteBorderIcon style={{ fontSize: '16px', color: 'var(--text-4)' }} />
						)}
						<span style={{ fontSize: '12px', color: 'var(--text-3)' }}>{formatCount(product.productLikes)}</span>
					</div>
				</div>
			</div>
		</div>
	);
};

export default MobileProductCard;
