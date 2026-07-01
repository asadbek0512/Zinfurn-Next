import { typeNotice, NoticeTranslations } from '../types/notice/notice';

type Locale = keyof NoticeTranslations;

const FALLBACK_LOCALE: Locale = 'en';

const normalizeLocale = (locale?: string): Locale => {
	const loc = (locale || FALLBACK_LOCALE) as Locale;
	return (['uz', 'en', 'ru', 'kr', 'ar'] as Locale[]).includes(loc) ? loc : FALLBACK_LOCALE;
};

/** Joriy tilga mos notice nomi. Tarjima yo'q bo'lsa — asl noticeTitle. */
export const getLocalizedNoticeTitle = (notice?: typeNotice | null, locale?: string): string => {
	if (!notice) return '';
	const loc = normalizeLocale(locale);
	return notice.noticeTranslations?.[loc]?.title?.trim() || notice.noticeTitle || '';
};

/** Joriy tilga mos notice matni. Tarjima yo'q bo'lsa — asl noticeContent. */
export const getLocalizedNoticeContent = (notice?: typeNotice | null, locale?: string): string => {
	if (!notice) return '';
	const loc = normalizeLocale(locale);
	return notice.noticeTranslations?.[loc]?.desc?.trim() || notice.noticeContent || '';
};
