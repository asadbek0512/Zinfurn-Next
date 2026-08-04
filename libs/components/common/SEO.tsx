import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

const SITE = 'Zinfurn';
const SITE_URL = 'https://zinfurn.uz';

// Tilga qarab default tavsif — "zinfurn nima" degan qidiruvda o'z tilida aniq javob chiqishi uchun
const DEFAULT_DESC_BY_LOCALE: Record<string, string> = {
	uz: 'Zinfurn — onlayn mebel doʻkoni va bozori. Divan, stol, stul, yotoqxona va oshxona mebellarini eng yaxshi narxlarda xarid qiling. Tez yetkazib berish.',
	en: 'Zinfurn — Best online furniture store. Shop sofas, tables, chairs, bedroom and kitchen furniture at the best prices. Fast delivery.',
	ru: 'Zinfurn — интернет-магазин мебели. Диваны, столы, стулья, мебель для спальни и кухни по лучшим ценам. Быстрая доставка.',
	kr: 'Zinfurn — 온라인 가구 쇼핑몰. 소파, 테이블, 의자, 침실 및 주방 가구를 최저가로 구매하세요. 빠른 배송.',
	ar: 'Zinfurn — متجر أثاث عبر الإنترنت. تسوق الأرائك والطاولات والكراسي وأثاث غرف النوم والمطبخ بأفضل الأسعار. توصيل سريع.',
};

// Tilga qarab default title
const DEFAULT_TITLE_BY_LOCALE: Record<string, string> = {
	uz: `${SITE} — Onlayn Mebel Doʻkoni`,
	en: `${SITE} — Best Furniture Store`,
	ru: `${SITE} — Интернет-магазин мебели`,
	kr: `${SITE} — 온라인 가구 쇼핑몰`,
	ar: `${SITE} — متجر الأثاث`,
};
const LOCALES = ['en', 'uz', 'ru', 'kr', 'ar'];
const DEFAULT_LOCALE = 'en';

// hreflang ISO 639-1 kod talab qiladi. Loyihada koreys uchun 'kr' ishlatiladi,
// lekin 'kr' — bu mamlakat kodi; noto'g'ri qiymatni Google e'tiborsiz qoldiradi.
const HREFLANG_BY_LOCALE: Record<string, string> = { kr: 'ko' };

// Link preview rasmi: kontentli banner (logo shaffof/oq bo'lib previewда bo'sh ko'rinardi)
const DEFAULT_IMAGE = `${SITE_URL}/img/banner/Home-1-.jpg`;
const DEFAULT_IMAGE_W = '1917';
const DEFAULT_IMAGE_H = '968';

interface SEOProps {
	title?: string;
	description?: string;
	image?: string;
	url?: string;
	type?: 'website' | 'product' | 'article';
	price?: number;
	currency?: string;
	noindex?: boolean;
	/** structured data (JSON-LD) override */
	jsonLd?: Record<string, unknown>;
}

const SEO = ({ title, description, image, url, type = 'website', price, currency = 'KRW', noindex, jsonLd }: SEOProps) => {
	const { locale = 'en', asPath } = useRouter();
	// Locale prefiksisiz yo'l — hreflang uchun har til varianti shundan yasaladi
	const basePath = (asPath || '/').split('?')[0].split('#')[0];
	const localeDesc = DEFAULT_DESC_BY_LOCALE[locale] || DEFAULT_DESC_BY_LOCALE.en;
	const localeTitle = DEFAULT_TITLE_BY_LOCALE[locale] || DEFAULT_TITLE_BY_LOCALE.en;

	const fullTitle = title ? `${title} | ${SITE}` : localeTitle;
	const desc = description || localeDesc;
	const img = image || DEFAULT_IMAGE;
	const isDefaultImg = img === DEFAULT_IMAGE;
	const canonical = url || SITE_URL;

	return (
		<Head>
			<title key="title">{fullTitle}</title>
			<meta key="desc" name="description" content={desc} />
			{noindex && <meta key="robots" name="robots" content="noindex,nofollow" />}
			<link key="canonical" rel="canonical" href={canonical} />

			{/* hreflang — 5 til versiyasi bir-birini ko'rsatadi, aks holda Google
			    ularni takroriy kontent deb hisoblab bittasini tashlab yuboradi */}
			{!noindex &&
				LOCALES.map((loc) => (
					<link
						key={`alt-${loc}`}
						rel="alternate"
						hrefLang={HREFLANG_BY_LOCALE[loc] || loc}
						href={`${SITE_URL}${loc === DEFAULT_LOCALE ? '' : `/${loc}`}${basePath}`}
					/>
				))}
			{!noindex && <link key="alt-default" rel="alternate" hrefLang="x-default" href={`${SITE_URL}${basePath}`} />}

			{/* Open Graph */}
			<meta key="og:title" property="og:title" content={fullTitle} />
			<meta key="og:desc" property="og:description" content={desc} />
			<meta key="og:type" property="og:type" content={type} />
			<meta key="og:image" property="og:image" content={img} />
			{isDefaultImg && <meta key="og:iw" property="og:image:width" content={DEFAULT_IMAGE_W} />}
			{isDefaultImg && <meta key="og:ih" property="og:image:height" content={DEFAULT_IMAGE_H} />}
			<meta key="og:url" property="og:url" content={canonical} />
			<meta key="og:site" property="og:site_name" content={SITE} />

			{/* Twitter */}
			<meta key="tw:card" name="twitter:card" content="summary_large_image" />
			<meta key="tw:title" name="twitter:title" content={fullTitle} />
			<meta key="tw:desc" name="twitter:description" content={desc} />
			<meta key="tw:image" name="twitter:image" content={img} />

			{/* Product price (rich result) */}
			{type === 'product' && price != null && (
				<>
					<meta key="og:pa" property="product:price:amount" content={String(price)} />
					<meta key="og:pc" property="product:price:currency" content={currency} />
				</>
			)}

			{jsonLd && (
				<script
					key="jsonld"
					type="application/ld+json"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
				/>
			)}
		</Head>
	);
};

export default SEO;
