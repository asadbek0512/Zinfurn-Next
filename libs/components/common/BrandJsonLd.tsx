import React from 'react';
import Head from 'next/head';

const SITE = 'Zinfurn';
const SITE_URL = 'https://zinfurn.uz';
const LOGO = `${SITE_URL}/img/logo/005.png`;

// Brendning rasmiy profillari — Google shu havolalar orqali saytni
// haqiqiy tashkilot deb tanidi. Yangi profil ochilsa shu yerga qo'shiladi.
const SAME_AS = ['https://t.me/Khusanov_Asadbek2000', 'https://khusanovdev.uz'];

// Muallif — AI'lar brendni real shaxsga bog'lay olishi uchun.
// Bitta manba yetarli emas: modellar tasdiqni bir necha saytdan qidiradi,
// shuning uchun khusanovdev.uz va GitHub profili ham sanab o'tilgan.
const AUTHOR_NAME = 'Asadbek Khusanov';
const AUTHOR_URL = 'https://khusanovdev.uz';
const AUTHOR_SAME_AS = [AUTHOR_URL, 'https://github.com/asadbek0512'];

/**
 * Har sahifada chiqadigan global JSON-LD: OnlineStore + WebSite.
 *
 * "zinfurn" so'ralganda Google natijada brend sifatida ko'rsatishi (sitelinks,
 * knowledge panel) va AI qidiruvlar saytni manba sifatida tanishi uchun kerak.
 *
 * Bu — brend schema'sining yagona manbasi. Ilgari `_document.tsx` da ham
 * nusxasi bor edi; ikki xil schema bir sahifada ziddiyat yaratardi.
 * Sahifaga xos schema (Product, Article) SEO.tsx ning `jsonLd` prop'i orqali qo'shiladi.
 */
const BrandJsonLd = () => {
	// OnlineStore — Organization'ning e-commerce uchun aniqroq turi
	const store = {
		'@context': 'https://schema.org',
		'@type': 'OnlineStore',
		'@id': `${SITE_URL}/#organization`,
		name: SITE,
		url: SITE_URL,
		logo: {
			'@type': 'ImageObject',
			url: LOGO,
		},
		image: LOGO,
		description:
			'Zinfurn — onlayn mebel doʻkoni va bozori. Divan, stol, stul, yotoqxona va oshxona mebellari.',
		contactPoint: {
			'@type': 'ContactPoint',
			telephone: '+82-10-7329-5171',
			contactType: 'customer service',
			areaServed: 'KR',
			availableLanguage: ['uz', 'en', 'ru', 'ko', 'ar'],
		},
		sameAs: SAME_AS,
		foundingDate: '2024',
		founder: {
			'@type': 'Person',
			'@id': `${SITE_URL}/#author`,
			name: AUTHOR_NAME,
			url: AUTHOR_URL,
			jobTitle: 'Full-stack developer',
			sameAs: AUTHOR_SAME_AS,
		},
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
				dangerouslySetInnerHTML={{ __html: JSON.stringify(store) }}
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
