import { useCallback, useEffect, useState } from 'react';
import { Product } from '../types/product/product';

/** localStorage kaliti va saqlanadigan maksimal mahsulot soni. */
const STORAGE_KEY = 'zinfurn_recently_viewed';
const MAX_ITEMS = 12;

/** Faqat ProductCard uchun zarur maydonlarni saqlaymiz — localStorage shishib ketmasin. */
const slim = (p: Product): Product =>
	({
		_id: p._id,
		productTitle: p.productTitle,
		productTranslations: (p as any).productTranslations,
		productPrice: p.productPrice,
		productSalePrice: (p as any).productSalePrice,
		productSaleActive: (p as any).productSaleActive,
		productImages: p.productImages?.slice(0, 2),
		productCategory: p.productCategory,
		productViews: p.productViews,
		productLikes: p.productLikes,
		productReviews: p.productReviews,
		productRank: (p as any).productRank,
	} as unknown as Product);

const read = (): Product[] => {
	if (typeof window === 'undefined') return [];
	try {
		const raw = window.localStorage.getItem(STORAGE_KEY);
		const parsed = raw ? JSON.parse(raw) : [];
		// property -> product rename'dan oldingi yozuvlarni tashlab yuboramiz
		return Array.isArray(parsed) ? parsed.filter((p: Partial<Product>) => typeof p?.productTitle === 'string') : [];
	} catch {
		return [];
	}
};

/**
 * "Oxirgi ko'rilgan mahsulotlar" ro'yxatini localStorage'da boshqaradi.
 * SSR-xavfsiz: boshlang'ich bo'sh, mount'dan keyin yuklanadi (hydration mismatch yo'q).
 */
export const useRecentlyViewed = () => {
	const [items, setItems] = useState<Product[]>([]);

	useEffect(() => {
		setItems(read());
	}, []);

	const add = useCallback((product?: Product | null) => {
		if (!product?._id || typeof window === 'undefined') return;
		try {
			const current = read().filter((p) => p._id !== product._id);
			const next = [slim(product), ...current].slice(0, MAX_ITEMS);
			window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
			setItems(next);
		} catch {
			/* localStorage to'liq yoki bloklangan — jimgina o'tkazamiz */
		}
	}, []);

	const clear = useCallback(() => {
		try {
			window.localStorage.removeItem(STORAGE_KEY);
		} catch {
			/* bo'sh */
		}
		setItems([]);
	}, []);

	return { items, add, clear };
};

export default useRecentlyViewed;
