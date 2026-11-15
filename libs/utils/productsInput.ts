import { Direction } from '../enums/common.enum';
import { PISearch, ProductsInquiry } from '../types/product/product.input';

/**
 * URL'dagi `?input=JSON` foydalanuvchi qo'lida — buzuq yoki zararli bo'lishi mumkin
 * (skanerlar shu yerga SQLi/XSS payload tiqadi). Faqat taniqli maydonlar, to'g'ri turda o'tadi;
 * qolgani tashlanadi. Enum qiymatlarini backend (class-validator) baribir tekshiradi.
 */

const MAX_PAGE = 1000;
const MAX_LIMIT = 50;
const MAX_TEXT_LENGTH = 100;
const MAX_LIST_SIZE = 20;
const SORT_FIELDS = ['createdAt', 'productPrice', 'productViews', 'productLikes', 'productRank', 'productSaleExpiresAt'];
const LIST_KEYS = ['categoryList', 'typeList', 'conditionList', 'materialList', 'colorList', 'options'] as const;
const SAFE_TOKEN = /^[A-Za-z0-9_]{1,40}$/;
const MONGO_ID = /^[a-f0-9]{24}$/i;

export const DEFAULT_PRODUCTS_INPUT: ProductsInquiry = {
	page: 1,
	limit: 9,
	sort: 'createdAt',
	direction: Direction.DESC,
	search: {},
};

type Raw = Record<string, unknown>;

const isObject = (v: unknown): v is Raw => typeof v === 'object' && v !== null && !Array.isArray(v);

const toInt = (v: unknown, min: number, max: number, fallback: number): number => {
	const n = typeof v === 'number' ? v : Number.NaN;
	return Number.isInteger(n) && n >= min && n <= max ? n : fallback;
};

const toTokenList = (v: unknown): string[] | undefined => {
	if (!Array.isArray(v)) return undefined;
	const list = v.filter((x): x is string => typeof x === 'string' && SAFE_TOKEN.test(x)).slice(0, MAX_LIST_SIZE);
	return list.length ? list : undefined;
};

const sanitizeSearch = (raw: unknown): PISearch => {
	if (!isObject(raw)) return {};
	const search: Raw = {};
	for (const key of LIST_KEYS) {
		const list = toTokenList(raw[key]);
		if (list) search[key] = list;
	}
	if (typeof raw.text === 'string' && raw.text.trim()) search.text = raw.text.trim().slice(0, MAX_TEXT_LENGTH);
	if (typeof raw.memberId === 'string' && MONGO_ID.test(raw.memberId)) search.memberId = raw.memberId;
	if (typeof raw.productIsOnSale === 'boolean') search.productIsOnSale = raw.productIsOnSale;
	const range = raw.pricesRange;
	if (isObject(range) && typeof range.start === 'number' && typeof range.end === 'number' && range.start >= 0 && range.end >= range.start) {
		search.pricesRange = { start: range.start, end: range.end };
	}
	return search as PISearch;
};

export const sanitizeProductsInput = (raw: unknown): ProductsInquiry => {
	if (!isObject(raw)) return { ...DEFAULT_PRODUCTS_INPUT };
	const d = DEFAULT_PRODUCTS_INPUT;
	return {
		page: toInt(raw.page, 1, MAX_PAGE, d.page),
		limit: toInt(raw.limit, 1, MAX_LIMIT, d.limit),
		sort: typeof raw.sort === 'string' && SORT_FIELDS.includes(raw.sort) ? raw.sort : d.sort,
		direction: raw.direction === Direction.ASC ? Direction.ASC : Direction.DESC,
		search: sanitizeSearch(raw.search),
	};
};

/** `router.query.input` / SSR `query.input` uchun: hech qachon throw qilmaydi */
export const parseProductsInput = (value: unknown): ProductsInquiry | null => {
	if (typeof value !== 'string' || !value) return null;
	try {
		return sanitizeProductsInput(JSON.parse(value));
	} catch {
		return null;
	}
};
