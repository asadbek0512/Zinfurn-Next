import React from 'react';
import Head from 'next/head';

const SITE = 'Zinfurn';
const SITE_URL = 'https://zinfurn.uz';
const DEFAULT_DESC =
	'Zinfurn — Best online furniture store. Shop sofas, tables, chairs, bedroom and kitchen furniture at the best prices. Fast delivery.';
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
	const fullTitle = title ? `${title} | ${SITE}` : `${SITE} — Best Furniture Store`;
	const desc = description || DEFAULT_DESC;
	const img = image || DEFAULT_IMAGE;
	const isDefaultImg = img === DEFAULT_IMAGE;
	const canonical = url || SITE_URL;

	return (
		<Head>
			<title key="title">{fullTitle}</title>
			<meta key="desc" name="description" content={desc} />
			{noindex && <meta key="robots" name="robots" content="noindex,nofollow" />}
			<link key="canonical" rel="canonical" href={canonical} />

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
