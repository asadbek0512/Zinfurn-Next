import { useCallback, useEffect, useState } from 'react';
import { Property } from '../types/property/property';

/** localStorage kaliti va saqlanadigan maksimal mahsulot soni. */
const STORAGE_KEY = 'zinfurn_recently_viewed';
const MAX_ITEMS = 12;

/** Faqat PropertyCard uchun zarur maydonlarni saqlaymiz — localStorage shishib ketmasin. */
const slim = (p: Property): Property =>
	({
		_id: p._id,
		propertyTitle: p.propertyTitle,
		propertyTranslations: (p as any).propertyTranslations,
		propertyPrice: p.propertyPrice,
		propertySalePrice: (p as any).propertySalePrice,
		propertySaleActive: (p as any).propertySaleActive,
		propertyImages: p.propertyImages?.slice(0, 2),
		propertyCategory: p.propertyCategory,
		propertyViews: p.propertyViews,
		propertyLikes: p.propertyLikes,
		propertyReviews: p.propertyReviews,
		propertyRank: (p as any).propertyRank,
	} as unknown as Property);

const read = (): Property[] => {
	if (typeof window === 'undefined') return [];
	try {
		const raw = window.localStorage.getItem(STORAGE_KEY);
		const parsed = raw ? JSON.parse(raw) : [];
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
};

/**
 * "Oxirgi ko'rilgan mahsulotlar" ro'yxatini localStorage'da boshqaradi.
 * SSR-xavfsiz: boshlang'ich bo'sh, mount'dan keyin yuklanadi (hydration mismatch yo'q).
 */
export const useRecentlyViewed = () => {
	const [items, setItems] = useState<Property[]>([]);

	useEffect(() => {
		setItems(read());
	}, []);

	const add = useCallback((property?: Property | null) => {
		if (!property?._id || typeof window === 'undefined') return;
		try {
			const current = read().filter((p) => p._id !== property._id);
			const next = [slim(property), ...current].slice(0, MAX_ITEMS);
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
