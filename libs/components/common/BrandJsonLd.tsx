import React from 'react';
import Head from 'next/head';

const SITE = 'Zinfurn';
const SITE_URL = 'https://zinfurn.uz';
const LOGO = `${SITE_URL}/img/logo/11.png`;

// Brendning rasmiy profillari. Google shu havolalar orqali saytni
// haqiqiy tashkilot deb tanidi — yangi profil ochilsa shu yerga qo'shiladi.
const SAME_AS: string[] = [];

/**
 * Har sahifada chiqadigan global JSON-LD: Organization + WebSite.
 *
 * Bu "zinfurn" so'raldi deganda Google natijada brend sifatida ko'rsatishi
 * (sitelinks, knowledge panel) va AI qidiruvlar saytni manba sifatida
 * tanishi uchun kerak. Sahifaga xos schema (Product, Article) SEO.tsx ning
 * `jsonLd` prop'i orqali alohida qo'shiladi.
 */
const BrandJsonLd = () => {
	const organization = {
		'@context': 'https://schema.org',
		'@type': 'Organization',
		'@id': `${SITE_URL}/#organization`,
		name: SITE,
		url: SITE_URL,
		logo: {
			'@type': 'ImageObject',
			url: LOGO,
		},
		description:
			'Zinfurn — onlayn mebel doʻkoni va bozori. Divan, stol, stul, yotoqxona va oshxona mebellari.',
		...(SAME_AS.length > 0 && { sameAs: SAME_AS }),
	};

	const website = {
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		'@id': `${SITE_URL}/#website`,
		name: SITE,
		alternateName: 'Zinfurn Furniture',
		url: SITE_URL,
		inLanguage: ['uz', 'en', 'ru', 'ko', 'ar'],
		publisher: { '@id': `${SITE_URL}/#organization` },
	};

	return (
		<Head>
			<script
				key="jsonld-organization"
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}
			/>
			<script
				key="jsonld-website"
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }}
			/>
		</Head>
	);
};

export default BrandJsonLd;
