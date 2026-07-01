import { RepairProperty, RepairTranslations } from '../types/repairProperty/repairProperty';

type Locale = keyof RepairTranslations;

const FALLBACK_LOCALE: Locale = 'en';

const normalizeLocale = (locale?: string): Locale => {
	const loc = (locale || FALLBACK_LOCALE) as Locale;
	return (['uz', 'en', 'ru', 'kr', 'ar'] as Locale[]).includes(loc) ? loc : FALLBACK_LOCALE;
};

/**
 * Joriy tilga mos repair tavsifini (= nom) qaytaradi.
 * Tarjima yo'q bo'lsa — asl repairPropertyDescription.
 */
export const getLocalizedRepairText = (repair?: RepairProperty | null, locale?: string): string => {
	if (!repair) return '';
	const loc = normalizeLocale(locale);
	return repair.repairPropertyTranslations?.[loc]?.title?.trim() || repair.repairPropertyDescription || '';
};
