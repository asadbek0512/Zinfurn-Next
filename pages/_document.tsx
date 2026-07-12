import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
	return (
		<Html lang="en">
			<Head>
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<meta name="robots" content="index,follow" />
				<meta name="google-site-verification" content="IygeEw_birveKtlTi85JuIJouvKjBnBSV9CPJ1NyGXE" />
				<link rel="icon" type="image/png" href="/img/logo/005.png" />
				<link rel="alternate" hrefLang="en" href="https://zinfurn.uz" />
				<link rel="alternate" hrefLang="ko" href="https://zinfurn.uz/kr" />
				<link rel="alternate" hrefLang="ru" href="https://zinfurn.uz/ru" />
				<link rel="alternate" hrefLang="uz" href="https://zinfurn.uz/uz" />
				<link rel="alternate" hrefLang="ar" href="https://zinfurn.uz/ar" />
				<link rel="alternate" hrefLang="x-default" href="https://zinfurn.uz" />

				<meta name="keywords" content={'zinfurn, zinfurn.uz, furniture, sofa, table, chair, bedroom furniture, kitchen furniture, best furniture store, 가구, 소파, 침대, 식탁'} />
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
				{/* Theme'ni birinchi paint'dan OLDIN qo'llash — dark/light flash bo'lmasligi uchun */}
				<script
					dangerouslySetInnerHTML={{
						__html: `(function(){try{var t=localStorage.getItem('theme');if(t!=='dark'&&t!=='light'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.dataset.theme=t;}catch(e){}})();`,
					}}
				/>
				<Main />
				<NextScript />
			</body>
		</Html>
	);
}
