import { GetServerSideProps } from 'next';

const SITE_URL = 'https://zinfurn.uz';
const LOCALES = ['en', 'uz', 'ru', 'kr', 'ar'];
const DEFAULT_LOCALE = 'en';

// Sitemap'ga qo'shiladigan mahsulot soni. Google bitta sitemap'da 50 000 URL qabul qiladi.
const PRODUCT_LIMIT = 500;
const FETCH_TIMEOUT_MS = 8000;

interface SitemapEntry {
	path: string;
	priority: string;
	changefreq: string;
	lastmod?: string;
	/** til versiyalari bor sahifalar uchun hreflang alternates chiqariladi */
	localized?: boolean;
}

// hreflang ISO 639-1 kod talab qiladi — loyihadagi 'kr' locale'i 'ko' ga o'giriladi
// (SEO.tsx dagi map bilan bir xil bo'lishi shart, aks holda Google ziddiyat ko'radi)
const HREFLANG_BY_LOCALE: Record<string, string> = { kr: 'ko' };

// Yo'llar oxirida slash YO'Q: next.config.js da trailingSlash yoqilmagan,
// shuning uchun '/products/' → '/products' ga 308 redirect bo'ladi.
// Sitemap redirect emas, yakuniy URL'ni ko'rsatishi kerak.
const staticPages: SitemapEntry[] = [
	{ path: '/', priority: '1.0', changefreq: 'daily', localized: true },
	{ path: '/products', priority: '0.9', changefreq: 'daily', localized: true },
	{ path: '/agent', priority: '0.8', changefreq: 'weekly', localized: true },
	{ path: '/repairService', priority: '0.7', changefreq: 'weekly', localized: true },
	{ path: '/community', priority: '0.7', changefreq: 'daily', localized: true },
	{ path: '/cs', priority: '0.5', changefreq: 'monthly', localized: true },
	// "Zinfurn nima?" javobi shu yerda — brend so'rovlari va AI uchun muhim
	{ path: '/about', priority: '0.8', changefreq: 'monthly', localized: true },
];

const GET_PROPERTIES_FOR_SITEMAP = `
	query GetPropertiesForSitemap($input: PropertiesInquiry!) {
		getProperties(input: $input) {
			list {
				_id
				updatedAt
			}
		}
	}
`;

const localePath = (locale: string, path: string) => (locale === DEFAULT_LOCALE ? path : `/${locale}${path}`);

const escapeXml = (value: string) =>
	value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * Mahsulot sahifalarini backend'dan oladi. Sitemap hech qachon butunlay
 * yiqilmasligi kerak — xatolik bo'lsa statik sahifalar baribir chiqadi.
 */
const fetchProductEntries = async (): Promise<SitemapEntry[]> => {
	const endpoint = process.env.REACT_APP_API_GRAPHQL_URL;
	if (!endpoint) return [];

	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

	try {
		const response = await fetch(endpoint, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			signal: controller.signal,
			body: JSON.stringify({
				query: GET_PROPERTIES_FOR_SITEMAP,
				variables: { input: { page: 1, limit: PRODUCT_LIMIT, search: {} } },
			}),
		});

		if (!response.ok) return [];

		const json = await response.json();
		const list = json?.data?.getProperties?.list;
		if (!Array.isArray(list)) return [];

		return list
			.filter((item: { _id?: string }) => Boolean(item?._id))
			.map((item: { _id: string; updatedAt?: string }) => ({
				path: `/products/detail?id=${item._id}`,
				priority: '0.8',
				changefreq: 'weekly',
				lastmod: item.updatedAt ? String(item.updatedAt).split('T')[0] : undefined,
			}));
	} catch {
		return [];
	} finally {
		clearTimeout(timer);
	}
};

const renderUrl = ({ path, priority, changefreq, lastmod, localized }: SitemapEntry, today: string) => {
	const alternates = localized
		? LOCALES.map(
				(locale) =>
					`\n    <xhtml:link rel="alternate" hreflang="${HREFLANG_BY_LOCALE[locale] || locale}" href="${escapeXml(
						`${SITE_URL}${localePath(locale, path)}`,
					)}"/>`,
		  ).join('') +
		  `\n    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(`${SITE_URL}${path}`)}"/>`
		: '';

	return `  <url>
    <loc>${escapeXml(`${SITE_URL}${path}`)}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
    <lastmod>${lastmod || today}</lastmod>${alternates}
  </url>`;
};

function SitemapXML() {
	return null;
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
	const today = new Date().toISOString().split('T')[0];
	const products = await fetchProductEntries();
	const entries = [...staticPages, ...products];

	const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.map((entry) => renderUrl(entry, today)).join('\n')}
</urlset>`;

	// Sitemap har so'rovda backend'ga bormasligi uchun 1 soat CDN/proxy keshi
	res.setHeader('Content-Type', 'application/xml');
	res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400');
	res.write(sitemap);
	res.end();

	return { props: {} };
};

export default SitemapXML;
