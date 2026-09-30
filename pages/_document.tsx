import { Html, Head, Main, NextScript } from 'next/document';

/** Loader'ning yuqori chegarasi — odatda AppSplashGate ancha oldin olib tashlaydi */
const BOOT_LOADER_MAX_MS = 10000;

export default function Document() {
	return (
		<Html lang="en">
			<Head>
				{/* viewport meta — AppBottomNav.tsx (next/head): app'da viewport-fit=cover kerak */}
				{/* robots meta SEO.tsx da — shaxsiy sahifalar (login, checkout, mypage)
				    noindex olishi uchun u sahifaga qarab o'zgarishi kerak */}
				<meta name="google-site-verification" content="IygeEw_birveKtlTi85JuIJouvKjBnBSV9CPJ1NyGXE" />
				{/* Jigarrang favicon — 005.png bilan bir xil o'lcham/shakl, qora tab'da ham Google oq doirasida ham ko'rinadi.
				    /favicon.ico — Google favicon crawler avval shu standart manzilni qidiradi (barqaror URL, ?v yo'q) */}
				<link rel="icon" href="/favicon.ico" sizes="any" />
				<link rel="icon" type="image/png" sizes="192x192" href="/favicon.png?v=13" />
				{/* PWA — iPhone'da "Bosh ekranga qo'shish" ilovadek (to'liq ekran) ochiladi */}
				<link rel="manifest" href="/manifest.webmanifest" />
				<link rel="apple-touch-icon" href="/img/logo/apple-touch-icon.png" />
				<meta name="apple-mobile-web-app-capable" content="yes" />
				<meta name="mobile-web-app-capable" content="yes" />
				<meta name="apple-mobile-web-app-title" content="Zinfurn" />
				<meta name="apple-mobile-web-app-status-bar-style" content="default" />
				{/* hreflang va brend JSON-LD bu yerda EMAS:
				    - hreflang → SEO.tsx (har sahifa o'z tilidagi variantiga ishora qilishi kerak;
				      bu yerda qattiq yozilganda har sahifa bosh sahifani ko'rsatardi)
				    - OnlineStore/WebSite schema → BrandJsonLd.tsx (yagona manba) */}

				{/* App yuklanish ekrani: SSR HTML desktop layout bilan keladi, mobil layout mount bo'lguncha
				    shu qoplama turadi (AppSplashGate olib tashlaydi). Web'da ko'rinmaydi.
				    Logo o'lchami/joyi native splash bilan bir xil — splash'dan o'tishda sakrash bo'lmaydi. */}
				<style
					dangerouslySetInnerHTML={{
						__html: `#app-boot-loader{display:none}html[data-app='1'] #app-boot-loader{display:flex;position:fixed;inset:0;z-index:2147483000;align-items:center;justify-content:center;background:var(--bg-page,#fff);transition:opacity .2s ease}#app-boot-loader.is-done{opacity:0;pointer-events:none}#app-boot-loader img{width:352px;height:352px;max-width:none;object-fit:contain}html[data-theme='dark'] #app-boot-loader img{filter:invert(1)}#app-boot-loader .dots{position:absolute;left:0;right:0;top:calc(50% + 84px);text-align:center}#app-boot-loader .dots span{display:inline-block;margin:0 2px;font-size:28px;line-height:1;color:var(--text-1,#222);animation:app-boot-dot 1.2s infinite ease-in-out}#app-boot-loader .dots span:nth-child(2){animation-delay:.15s}#app-boot-loader .dots span:nth-child(3){animation-delay:.3s}#app-boot-loader .dots span:nth-child(4){animation-delay:.45s}#app-boot-loader .dots span:nth-child(5){animation-delay:.6s}@keyframes app-boot-dot{0%,80%,100%{opacity:.2;transform:translateY(0)}40%{opacity:1;transform:translateY(-6px)}}`,
					}}
				/>

				<meta name="keywords" content={'zinfurn, zinfurn.uz, furniture, sofa, table, chair, bedroom furniture, kitchen furniture, best furniture store, 가구, 소파, 침대, 식탁'} />
			</Head>
			<body>
				{/* Theme'ni birinchi paint'dan OLDIN qo'llash — dark/light flash bo'lmasligi uchun */}
				<script
					dangerouslySetInnerHTML={{
						__html: `(function(){try{var t=localStorage.getItem('theme');if(t!=='dark'&&t!=='light'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.dataset.theme=t;}catch(e){}})();`,
					}}
				/>
				{/* App (Capacitor WebView) rejimi — birinchi paint'dan OLDIN belgilanadi, shunda
				    pastdagi navbar/yashirin yon menyu CSS'i sakrash (flash) bilan qo'llanmaydi.
				    UA tag'i zinfurn-app/capacitor.config.ts dagi appendUserAgent bilan bir xil. */}
				<script
					dangerouslySetInnerHTML={{
						__html: `(function(){try{if(/ZinfurnApp/.test(navigator.userAgent)){document.documentElement.dataset.app='1';}}catch(e){}})();`,
					}}
				/>
				<div id="app-boot-loader" aria-hidden="true">
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img src="/img/banner/001..png" alt="" />
					<div className="dots">
						<span>.</span>
						<span>.</span>
						<span>.</span>
						<span>.</span>
						<span>.</span>
					</div>
				</div>
				{/* JS yiqilsa ham loader abadiy qolib ketmasin */}
				<script
					dangerouslySetInnerHTML={{
						__html: `setTimeout(function(){var l=document.getElementById('app-boot-loader');if(l)l.remove();},${BOOT_LOADER_MAX_MS});`,
					}}
				/>
				<Main />
				<NextScript />
			</body>
		</Html>
	);
}
