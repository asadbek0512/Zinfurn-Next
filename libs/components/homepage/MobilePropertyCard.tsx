import React from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useReactiveVar } from '@apollo/client';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { Property } from '../../types/property/property';
import { REACT_APP_API_URL } from '../../config';
import { formatCount } from '../../utils';
import { useCurrency } from '../../context/CurrencyContext';
import { userVar } from '../../../apollo/store';
import { getLocalizedTitle } from '../../utils/localizeProperty';

interface MobilePropertyCardProps {
	property: Property;
	likePropertyHandler: (user: any, propertyId: string) => void;
}

/**
 * Homepage mobil mahsulot kartochkasi — TrendProperties va TopProperties (va boshqalar)
 * uchun yagona manba. Narx (asl tepada, skidka pastida) + like bir joyda.
 */
const MobilePropertyCard = ({ property, likePropertyHandler }: MobilePropertyCardProps) => {
	const router = useRouter();
	const { t } = useTranslation('common');
	const { formatPrice } = useCurrency();
	const user = useReactiveVar(userVar);

	const discountPercent =
		property.propertyPrice && property.propertySalePrice
			? Math.round(((property.propertyPrice - property.propertySalePrice) / property.propertyPrice) * 100)
			: 0;
	const imgUrl = `${REACT_APP_API_URL}/${property.propertyImages?.[0]}`;
	const title = getLocalizedTitle(property, router.locale);

	return (
		<div
			style={{ background: 'var(--surface)', borderRadius: '12px', overflow: 'hidden', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
			onClick={() => router.push({ pathname: '/products/detail', query: { id: property._id } })}
		>
			<div style={{ position: 'relative', height: '170px', background: 'var(--surface)' }}>
				<img loading="lazy" decoding="async" src={imgUrl} alt={title} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '4px' }} />
				<div style={{ position: 'absolute', top: '8px', left: '8px', right: '8px', display: 'flex', justifyContent: 'space-between' }}>
					{discountPercent > 0 && (
						<span style={{ background: '#ff6b35', color: '#fff', fontSize: '10px', padding: '2px 6px', borderRadius: '4px' }}>-{discountPercent}%</span>
					)}
					<span style={{ background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: '10px', padding: '2px 6px', borderRadius: '4px', marginLeft: 'auto' }}>
						{t(property.propertyCategory)}
					</span>
				</div>
			</div>
			<div style={{ padding: '8px 10px' }}>
				<div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '6px' }}>
					{title}
				</div>
				<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '6px' }}>
					<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: 0 }}>
						{property.propertySalePrice ? (
							<>
								<span style={{ fontSize: '11px', color: 'var(--text-4)', textDecoration: 'line-through' }}>{formatPrice(property.propertyPrice)}</span>
								<span style={{ fontSize: '14px', fontWeight: 700, color: '#ff6b35' }}>{formatPrice(property.propertySalePrice)}</span>
							</>
						) : (
							<span style={{ fontSize: '14px', fontWeight: 700, color: '#ff6b35' }}>{formatPrice(property.propertyPrice)}</span>
						)}
					</div>
					<div
						style={{ display: 'flex', alignItems: 'center', gap: '2px', flexShrink: 0 }}
						onClick={(e) => {
							e.stopPropagation();
							likePropertyHandler(user, property._id);
						}}
					>
						{property?.meLiked?.[0]?.myFavorite ? (
							<FavoriteIcon style={{ fontSize: '16px', color: 'red' }} />
						) : (
							<FavoriteBorderIcon style={{ fontSize: '16px', color: 'var(--text-4)' }} />
						)}
						<span style={{ fontSize: '12px', color: 'var(--text-3)' }}>{formatCount(property.propertyLikes)}</span>
					</div>
				</div>
			</div>
		</div>
	);
};

export default MobilePropertyCard;
