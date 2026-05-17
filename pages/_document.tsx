import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
	return (
		<Html lang="en">
			<Head>
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<meta name="robots" content="index,follow" />
				<link rel="icon"  type="image/png" href="/img/logo/005.png" />
				

				{/* SEO */}
				<meta name="keywords" content={'zinfurn, zinfurn.uz, mebel, furniture, uzbekistan, divan, stol, stul, yotoqxona mebellar, oshxona mebellar'} />
				<meta
					name={'description'}
					content={
						'Zinfurn — O\'zbekistondagi eng yaxshi mebel do\'koni. Divan, stol, stul, yotoqxona va oshxona mebellarini eng yaxshi narxlarda toping | ' +
						'Zinfurn — лучший мебельный магазин в Узбекистане. Диваны, столы, стулья, мебель для спальни и кухни по лучшим ценам | ' +
						'Zinfurn — Best furniture store in Uzbekistan. Find sofas, tables, chairs, bedroom and kitchen furniture at the best prices on zinfurn.uz'
					}
				/>
				<meta property="og:title" content="Zinfurn — Mebel Do'koni" />
				<meta property="og:description" content="O'zbekistondagi eng yaxshi mebel do'koni. Divan, stol, stul va boshqa mebellarni toping." />
				<meta property="og:type" content="website" />
				<meta property="og:site_name" content="Zinfurn" />
			</Head>
			<body>
				<Main />
				<NextScript />
				
			</body>
		</Html>
	);
}
