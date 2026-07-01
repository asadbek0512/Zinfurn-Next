import { BoardArticle, ArticleTranslations } from '../types/board-article/board-article';

type Locale = keyof ArticleTranslations;

const FALLBACK_LOCALE: Locale = 'en';

const normalizeLocale = (locale?: string): Locale => {
	const loc = (locale || FALLBACK_LOCALE) as Locale;
	return (['uz', 'en', 'ru', 'kr', 'ar'] as Locale[]).includes(loc) ? loc : FALLBACK_LOCALE;
};

/**
 * Joriy tilga mos artikl nomini qaytaradi. Tarjima yo'q bo'lsa — asl articleTitle.
 */
export const getLocalizedArticleTitle = (article?: BoardArticle | null, locale?: string): string => {
	if (!article) return '';
	const loc = normalizeLocale(locale);
	return article.articleTranslations?.[loc]?.title?.trim() || article.articleTitle || '';
};

/**
 * Joriy tilga mos artikl matni (content). Tarjima yo'q bo'lsa — asl articleContent.
 */
export const getLocalizedArticleContent = (article?: BoardArticle | null, locale?: string): string => {
	if (!article) return '';
	const loc = normalizeLocale(locale);
	return article.articleTranslations?.[loc]?.desc?.trim() || article.articleContent || '';
};
