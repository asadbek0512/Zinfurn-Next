import { Product, ProductTranslations } from '../types/product/product';

type Locale = keyof ProductTranslations;

const FALLBACK_LOCALE: Locale = 'en';

const normalizeLocale = (locale?: string): Locale => {
	const loc = (locale || FALLBACK_LOCALE) as Locale;
	return (['uz', 'en', 'ru', 'kr', 'ar'] as Locale[]).includes(loc) ? loc : FALLBACK_LOCALE;
};

/**
 * Joriy tilga mos product nomini qaytaradi.
 * Tarjima yo'q bo'lsa — asl productTitle (hech qachon bo'sh qaytmaydi).
 */
export const getLocalizedTitle = (product?: Product | null, locale?: string): string => {
	if (!product) return '';
	const loc = normalizeLocale(locale);
	return product.productTranslations?.[loc]?.title?.trim() || product.productTitle || '';
};

/**
 * Joriy tilga mos description. Tarjima yo'q bo'lsa — asl productDesc.
 */
export const getLocalizedDesc = (product?: Product | null, locale?: string): string => {
	if (!product) return '';
	const loc = normalizeLocale(locale);
	return product.productTranslations?.[loc]?.desc?.trim() || product.productDesc || '';
};
