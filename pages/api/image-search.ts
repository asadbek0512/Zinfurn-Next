import type { NextApiRequest, NextApiResponse } from 'next';
import { PropertyType } from '../../libs/enums/property.enum';

/**
 * Kamera bilan qidiruv: foydalanuvchi rasmi + katalog Gemini vision'ga beriladi,
 * u mebel turini aniqlab, katalogdan eng o'xshash mahsulotlarni tanlaydi.
 */
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_VISION_MODEL || 'gemini-2.5-flash';
const GQL_URL = process.env.REACT_APP_API_GRAPHQL_URL || 'http://localhost:3007/graphql';
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3007';

const CATALOG_LIMIT = 100;
const MAX_RESULTS = 8;
/** Client rasmni ~1MB JPEG'gacha kichraytiradi; base64 hisobiga zaxira */
const BODY_SIZE_LIMIT = '3mb';
const DAILY_LIMIT = 20;
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'];
const LOCALES = ['uz', 'en', 'ru', 'kr', 'ar'];

export const config = { api: { bodyParser: { sizeLimit: BODY_SIZE_LIMIT } } };

interface CatalogItem {
	_id: string;
	propertyTitle: string;
	propertyCategory?: string;
	propertyType?: string;
	propertyMaterial?: string;
	propertyColor?: string;
	propertyPrice?: number;
	propertySalePrice?: number;
	propertyImages?: string[];
	propertyTranslations?: Record<string, { title?: string }>;
}

export interface ImageSearchProduct {
	_id: string;
	title: string;
	price: number;
	originalPrice: number | null;
	image: string;
}

export interface ImageSearchResponse {
	type: PropertyType | null;
	description: string;
	products: ImageSearchProduct[];
	error?: string;
}

const rateMap = new Map<string, number>();
let rateDay = new Date().toISOString().slice(0, 10);

const allowRequest = (ip: string): boolean => {
	const day = new Date().toISOString().slice(0, 10);
	if (day !== rateDay) {
		rateMap.clear();
		rateDay = day;
	}
	const count = rateMap.get(ip) ?? 0;
	if (count >= DAILY_LIMIT) return false;
	rateMap.set(ip, count + 1);
	return true;
};

const fetchCatalog = async (): Promise<CatalogItem[]> => {
	const query = `query { getProperties(input:{ page:1, limit:${CATALOG_LIMIT}, sort:"propertyRank", direction:DESC, search:{} }) {
		list { _id propertyTitle propertyCategory propertyType propertyMaterial propertyColor propertyPrice propertySalePrice propertyImages
			propertyTranslations { uz{title} en{title} ru{title} kr{title} ar{title} } } } }`;
	const r = await fetch(GQL_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query }) });
	const d = await r.json();
	return d?.data?.getProperties?.list || [];
};

const localizedTitle = (p: CatalogItem, locale: string): string => p.propertyTranslations?.[locale]?.title?.trim() || p.propertyTitle;

const handler = async (req: NextApiRequest, res: NextApiResponse<ImageSearchResponse>) => {
	const empty: ImageSearchResponse = { type: null, description: '', products: [] };
	if (req.method !== 'POST') return res.status(405).json({ ...empty, error: 'Method not allowed' });
	if (!GEMINI_API_KEY) return res.status(500).json({ ...empty, error: 'No AI key configured' });

	const { image, mimeType, locale: rawLocale } = (req.body ?? {}) as { image?: string; mimeType?: string; locale?: string };
	const locale = LOCALES.includes(rawLocale ?? '') ? (rawLocale as string) : 'en';
	if (typeof image !== 'string' || !image || !ALLOWED_MIME.includes(mimeType ?? '')) {
		return res.status(400).json({ ...empty, error: 'Invalid image' });
	}

	const ip =
		(req.headers['x-real-ip'] as string) ||
		((req.headers['x-forwarded-for'] as string) || '').split(',')[0].trim() ||
		req.socket?.remoteAddress ||
		'unknown';
	if (!allowRequest(ip)) return res.status(429).json({ ...empty, error: 'Daily limit reached' });

	try {
		const catalog = await fetchCatalog();
		const catalogText = catalog
			.map(
				(p) =>
					`- id:${p._id} | ${p.propertyTitle} | category:${p.propertyCategory} | type:${p.propertyType} | material:${p.propertyMaterial} | color:${p.propertyColor}`,
			)
			.join('\n');
		const prompt = `You are a furniture visual search engine. Look at the photo and find the most visually similar products in the catalog
(same furniture type first, then similar style, colour and material).
Furniture types: ${Object.values(PropertyType).join(', ')}.
Return JSON: {"type": one of the types or null if the photo has no furniture, "description": short description of the furniture in the photo (max 12 words, language: ${locale}), "productIds": up to ${MAX_RESULTS} catalog ids, best match first}.
Only use ids from this catalog:
${catalogText}`;

		const gr = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				contents: [{ role: 'user', parts: [{ inline_data: { mime_type: mimeType, data: image } }, { text: prompt }] }],
				generationConfig: { responseMimeType: 'application/json', temperature: 0.2 },
			}),
		});
		const gd = await gr.json();
		const parsed = JSON.parse(gd?.candidates?.[0]?.content?.parts?.[0]?.text || '{}') as {
			type?: string;
			description?: string;
			productIds?: string[];
		};

		const type = Object.values(PropertyType).includes(parsed.type as PropertyType) ? (parsed.type as PropertyType) : null;
		const byId = new Map(catalog.map((p) => [p._id, p]));
		const products = (Array.isArray(parsed.productIds) ? parsed.productIds : [])
			.map((id) => byId.get(id))
			.filter((p): p is CatalogItem => Boolean(p))
			.slice(0, MAX_RESULTS)
			.map((p) => ({
				_id: p._id,
				title: localizedTitle(p, locale),
				price: p.propertySalePrice || p.propertyPrice || 0,
				originalPrice: p.propertySalePrice ? p.propertyPrice ?? null : null,
				image: p.propertyImages?.[0] ? `${API_URL}/${p.propertyImages[0]}` : '',
			}));

		return res.status(200).json({ type, description: String(parsed.description ?? ''), products });
	} catch (err) {
		console.error('image search failed', err);
		return res.status(500).json({ ...empty, error: 'Search failed' });
	}
};

export default handler;
