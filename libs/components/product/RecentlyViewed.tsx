import React from 'react';
import { useTranslation } from 'next-i18next';
import useRecentlyViewed from '../../hooks/useRecentlyViewed';
import ProductCard from './ProductCard';
import { Product } from '../../types/product/product';

interface RecentlyViewedProps {
	/** Joriy mahsulot — ro'yxatdan chiqarib tashlanadi (o'zini ko'rsatmasin). */
	currentId?: string;
}

/**
 * "Oxirgi ko'rilgan mahsulotlar" — localStorage'dan o'qiydi, gorizontal strip.
 * Element bo'lmasa hech narsa render qilmaydi. MUI tiplash murakkabligidan qochish
 * uchun ataylab oddiy HTML + inline style ishlatilgan.
 */
const RecentlyViewed = ({ currentId }: RecentlyViewedProps) => {
	const { t } = useTranslation('common');
	const { items } = useRecentlyViewed();

	const list = items.filter((p) => p._id !== currentId);
	if (!list.length) return null;

	return (
		<div style={{ width: '100%', marginTop: 32 }}>
			<h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>{t('Recently viewed')}</h3>
			<div
				style={{
					display: 'flex',
					gap: 16,
					overflowX: 'auto',
					paddingBottom: 8,
					scrollSnapType: 'x mandatory',
				}}
			>
				{list.map((product: Product) => (
					<div key={product._id} style={{ flex: '0 0 auto', width: 260, scrollSnapAlign: 'start' }}>
						<ProductCard product={product} recentlyVisited />
					</div>
				))}
			</div>
		</div>
	);
};

export default RecentlyViewed;
