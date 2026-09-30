import { Html, Head, Main, NextScript } from 'next/document';

/** Loader'ning yuqori chegarasi — odatda AppSplashGate ancha oldin olib tashlaydi */
const BOOT_LOADER_MAX_MS = 10000;
const SPLASH_HIDE_FADE_MS = 200;

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
				    Ko'rinishi web'dagi bosh sahifa loader'i (pages/index.tsx .page-loader) bilan bir xil. */}
				<style
					dangerouslySetInnerHTML={{
						__html: `#app-boot-loader{display:none}html[data-app='1'] #app-boot-loader{display:flex;position:fixed;inset:0;z-index:2147483000;align-items:center;justify-content:center;background:var(--bg-page,#fff);transition:opacity .25s ease}#app-boot-loader.is-done{opacity:0;pointer-events:none}#app-boot-loader .loader-content{display:flex;flex-direction:row;align-items:center;gap:24px}#app-boot-loader img{width:140px;height:auto}html[data-theme='dark'] #app-boot-loader img{filter:invert(1)}#app-boot-loader .dots{display:flex;gap:6px}#app-boot-loader .dots span{font-size:72px;font-weight:bold;color:var(--text-2,#666);animation:app-boot-blink 1.4s infinite}#app-boot-loader .dots span:nth-child(2){animation-delay:.2s}#app-boot-loader .dots span:nth-child(3){animation-delay:.4s}#app-boot-loader .dots span:nth-child(4){animation-delay:.6s}#app-boot-loader .dots span:nth-child(5){animation-delay:.8s}@keyframes app-boot-blink{0%,80%,100%{opacity:0}40%{opacity:1}}`,
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
					<div className="loader-content">
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
				</div>
				{/* JS yiqilsa ham loader abadiy qolib ketmasin */}
				<script
					dangerouslySetInnerHTML={{
						// Loader chizildi — native splash'ni yopamiz (Capacitor bridge sahifadan oldin inject qilinadi)
						__html: `setTimeout(function(){var l=document.getElementById('app-boot-loader');if(l)l.remove();},${BOOT_LOADER_MAX_MS});try{var C=window.Capacitor;if(C&&C.nativePromise&&C.isNativePlatform&&C.isNativePlatform())requestAnimationFrame(function(){C.nativePromise('SplashScreen','hide',{fadeOutDuration:${SPLASH_HIDE_FADE_MS}}).catch(function(){});});}catch(e){}`,
					}}
				/>
				<Main />
				<NextScript />
			</body>
		</Html>
	);
}
