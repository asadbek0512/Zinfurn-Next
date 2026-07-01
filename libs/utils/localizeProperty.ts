import { Property, PropertyTranslations } from '../types/property/property';

type Locale = keyof PropertyTranslations;

const FALLBACK_LOCALE: Locale = 'en';

const normalizeLocale = (locale?: string): Locale => {
	const loc = (locale || FALLBACK_LOCALE) as Locale;
	return (['uz', 'en', 'ru', 'kr', 'ar'] as Locale[]).includes(loc) ? loc : FALLBACK_LOCALE;
};

/**
 * Joriy tilga mos product nomini qaytaradi.
 * Tarjima yo'q bo'lsa — asl propertyTitle (hech qachon bo'sh qaytmaydi).
 */
export const getLocalizedTitle = (property?: Property | null, locale?: string): string => {
	if (!property) return '';
	const loc = normalizeLocale(locale);
	return property.propertyTranslations?.[loc]?.title?.trim() || property.propertyTitle || '';
};

/**
 * Joriy tilga mos description. Tarjima yo'q bo'lsa — asl propertyDesc.
 */
export const getLocalizedDesc = (property?: Property | null, locale?: string): string => {
	if (!property) return '';
	const loc = normalizeLocale(locale);
	return property.propertyTranslations?.[loc]?.desc?.trim() || property.propertyDesc || '';
};
