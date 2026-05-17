import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
	return (
		<Html lang="en">
			<Head>
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<meta name="robots" content="index,follow" />
				<link rel="icon" type="image/png" href="/img/logo/005.png" />
				<link rel="alternate" hrefLang="en" href="https://zinfurn.uz" />
				<link rel="alternate" hrefLang="ko" href="https://zinfurn.uz/kr" />
				<link rel="alternate" hrefLang="ru" href="https://zinfurn.uz/ru" />
				<link rel="alternate" hrefLang="uz" href="https://zinfurn.uz/uz" />
				<link rel="alternate" hrefLang="ar" href="https://zinfurn.uz/ar" />
				<link rel="alternate" hrefLang="x-default" href="https://zinfurn.uz" />
				

				{/* SEO */}
				<title>Zinfurn — Best Furniture Store | Shop Sofas, Tables & More</title>
				<meta name="keywords" content={'zinfurn, zinfurn.uz, furniture, sofa, table, chair, bedroom furniture, kitchen furniture, best furniture store, 가구, 소파, 침대, 식탁'} />
				<meta
					name={'description'}
					content={
						'Zinfurn — Best online furniture store. Shop sofas, tables, chairs, bedroom and kitchen furniture at the best prices. Fast delivery | ' +
						'Zinfurn — 최고의 가구 쇼핑몰. 소파, 테이블, 의자, 침실 및 주방 가구를 최저가로 만나보세요. 빠른 배송 | ' +
						'Zinfurn — zinfurn.uz'
					}
				/>
				<meta property="og:title" content="Zinfurn — Best Furniture Store" />
				<meta property="og:description" content="Shop sofas, tables, chairs, bedroom and kitchen furniture at the best prices. Fast delivery." />
				<meta property="og:type" content="website" />
				<meta property="og:site_name" content="Zinfurn" />
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify({
							'@context': 'https://schema.org',
							'@type': 'OnlineStore',
							name: 'Zinfurn',
							description: "Best online furniture store",
							url: 'https://zinfurn.uz',
							logo: 'https://zinfurn.uz/img/logo/005.png',
							contactPoint: {
								'@type': 'ContactPoint',
								telephone: '+82-10-7329-5171',
								contactType: 'customer service',
								areaServed: 'KR',
							},
							sameAs: ['https://t.me/Khusanov_Asadbek2000'],
						}),
					}}
				/>
			</Head>
			<body>
				<Main />
				<NextScript />
				
			</body>
		</Html>
	);
}
