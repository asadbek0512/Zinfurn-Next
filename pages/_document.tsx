import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
	return (
		<Html lang="en">
			<Head>
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				{/* robots meta SEO.tsx da — shaxsiy sahifalar (login, checkout, mypage)
				    noindex olishi uchun u sahifaga qarab o'zgarishi kerak */}
				<meta name="google-site-verification" content="IygeEw_birveKtlTi85JuIJouvKjBnBSV9CPJ1NyGXE" />
				{/* Jigarrang favicon — 005.png bilan bir xil o'lcham/shakl, qora tab'da ham Google oq doirasida ham ko'rinadi.
				    /favicon.ico — Google favicon crawler avval shu standart manzilni qidiradi (barqaror URL, ?v yo'q) */}
				<link rel="icon" href="/favicon.ico" sizes="any" />
				<link rel="icon" type="image/png" sizes="192x192" href="/favicon.png?v=13" />
				{/* hreflang va brend JSON-LD bu yerda EMAS:
				    - hreflang → SEO.tsx (har sahifa o'z tilidagi variantiga ishora qilishi kerak;
				      bu yerda qattiq yozilganda har sahifa bosh sahifani ko'rsatardi)
				    - OnlineStore/WebSite schema → BrandJsonLd.tsx (yagona manba) */}

				<meta name="keywords" content={'zinfurn, zinfurn.uz, furniture, sofa, table, chair, bedroom furniture, kitchen furniture, best furniture store, 가구, 소파, 침대, 식탁'} />
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
