import { RepairProduct, RepairTranslations } from '../types/repairProduct/repairProduct';

type Locale = keyof RepairTranslations;

const FALLBACK_LOCALE: Locale = 'en';

const normalizeLocale = (locale?: string): Locale => {
	const loc = (locale || FALLBACK_LOCALE) as Locale;
	return (['uz', 'en', 'ru', 'kr', 'ar'] as Locale[]).includes(loc) ? loc : FALLBACK_LOCALE;
};

/**
 * Joriy tilga mos repair tavsifini (= nom) qaytaradi.
 * Tarjima yo'q bo'lsa — asl repairProductDescription.
 */
export const getLocalizedRepairText = (repair?: RepairProduct | null, locale?: string): string => {
	if (!repair) return '';
	const loc = normalizeLocale(locale);
	return repair.repairProductTranslations?.[loc]?.title?.trim() || repair.repairProductDescription || '';
};
