/**
 * IndexNow — sahifa o'zgarganini Bing va Yandex'ga bir zumda bildiradi.
 *
 * Google IndexNow'ni qo'llamaydi (u sitemap orqali oladi), lekin ChatGPT Search
 * Bing indeksidan foydalanadi — shuning uchun brend AI'da ko'rinishi uchun muhim.
 *
 * Egalik `public/<KEY>.txt` fayli orqali tasdiqlanadi, akkaunt kerak emas.
 * Ishlatish:  node scripts/indexnow.mjs [url ...]
 * URL berilmasa — sitemap'dagi asosiy sahifalar yuboriladi.
 */

const KEY = '3898e708918e0edf6f7d2cf6ee07d493';
const HOST = 'zinfurn.uz';
const SITE_URL = `https://${HOST}`;
const ENDPOINT = 'https://api.indexnow.org/indexnow';

const LOCALES = ['en', 'uz', 'ru', 'kr', 'ar'];
const PATHS = ['/', '/about', '/property', '/agent', '/repairService', '/community', '/cs'];

const defaultUrls = () =>
	PATHS.flatMap((path) => LOCALES.map((locale) => `${SITE_URL}${locale === 'en' ? '' : `/${locale}`}${path}`));

const main = async () => {
	const urlList = process.argv.slice(2).length ? process.argv.slice(2) : defaultUrls();

	const response = await fetch(ENDPOINT, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json; charset=utf-8' },
		body: JSON.stringify({
			host: HOST,
			key: KEY,
			keyLocation: `${SITE_URL}/${KEY}.txt`,
			urlList,
		}),
	});

	// 200 va 202 ikkalasi ham muvaffaqiyat: 202 "kalit tekshirilmoqda" degani
	console.log(`IndexNow: ${response.status} ${response.statusText} — ${urlList.length} ta URL`);
	if (!response.ok && response.status !== 202) {
		console.log(await response.text());
		process.exit(1);
	}
};

main();
