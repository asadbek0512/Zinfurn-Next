/* Zinfurn service worker — internet yo'qolganda oldin ochilgan sahifa va ma'lumotlarni keshdan ko'rsatadi.
 * Strategiya:
 *  - sahifalar + /_next/data: network-first (timeout) → kesh → /offline.html
 *  - /_next/static, /img, /locales, shriftlar: cache-first
 *  - API rasmlari: cache-first (cheklangan soni)
 *  - GraphQL query (POST): network-first → kesh (body+token hash kaliti). Mutation keshlanmaydi.
 * VERSION o'zgarsa eski keshlar o'chiriladi.
 */
const VERSION = 'v1';
const PAGE_CACHE = `pages-${VERSION}`;
const STATIC_CACHE = `static-${VERSION}`;
const IMAGE_CACHE = `images-${VERSION}`;
const API_CACHE = `api-${VERSION}`;
const KNOWN_CACHES = [PAGE_CACHE, STATIC_CACHE, IMAGE_CACHE, API_CACHE];

const OFFLINE_URL = '/offline.html';
const API_HOST = 'api.zinfurn.uz';
const NETWORK_TIMEOUT_MS = 6000;
const MAX_PAGES = 60;
const MAX_IMAGES = 300;
const MAX_API = 200;
const STATIC_PREFIXES = ['/_next/static/', '/img/', '/locales/', '/vendor/', '/fonts/'];
const IMAGE_EXT = /\.(png|jpe?g|webp|gif|svg|avif)$/i;

self.addEventListener('install', (event) => {
	event.waitUntil(
		(async () => {
			const cache = await caches.open(PAGE_CACHE);
			await cache.add(new Request(OFFLINE_URL, { cache: 'reload' }));
			await self.skipWaiting();
		})(),
	);
});

self.addEventListener('activate', (event) => {
	event.waitUntil(
		(async () => {
			const names = await caches.keys();
			await Promise.all(names.filter((n) => !KNOWN_CACHES.includes(n)).map((n) => caches.delete(n)));
			await self.clients.claim();
		})(),
	);
});

// Logout: boshqa user ma'lumoti keshda qolmasin
self.addEventListener('message', (event) => {
	if (event.data && event.data.type === 'CLEAR_USER_CACHE') {
		event.waitUntil(caches.delete(API_CACHE));
	}
});

self.addEventListener('fetch', (event) => {
	const { request } = event;
	const url = new URL(request.url);

	if (url.protocol !== 'https:' && url.hostname !== 'localhost') return;

	if (url.origin === self.location.origin) {
		if (request.method !== 'GET') return;
		if (url.pathname.startsWith('/api/') || url.pathname === '/sw.js') return;
		if (request.mode === 'navigate') return event.respondWith(handlePage(request));
		if (url.pathname.startsWith('/_next/data/')) return event.respondWith(networkFirst(request, PAGE_CACHE, MAX_PAGES));
		if (url.pathname.startsWith('/_next/image')) return event.respondWith(cacheFirst(request, IMAGE_CACHE, MAX_IMAGES));
		if (STATIC_PREFIXES.some((p) => url.pathname.startsWith(p)) || /\.(woff2?|ttf|otf)$/i.test(url.pathname)) {
			return event.respondWith(cacheFirst(request, STATIC_CACHE));
		}
		if (IMAGE_EXT.test(url.pathname)) return event.respondWith(cacheFirst(request, IMAGE_CACHE, MAX_IMAGES));
		return;
	}

	if (url.hostname === API_HOST) {
		if (request.method === 'GET' && IMAGE_EXT.test(url.pathname)) {
			return event.respondWith(cacheFirst(request, IMAGE_CACHE, MAX_IMAGES));
		}
		if (request.method === 'POST' && url.pathname === '/graphql') {
			return event.respondWith(handleGraphql(request));
		}
		return;
	}

	if (url.hostname === 'fonts.gstatic.com' || url.hostname === 'fonts.googleapis.com') {
		return event.respondWith(cacheFirst(request, STATIC_CACHE));
	}
});

async function handlePage(request) {
	try {
		return await networkFirst(request, PAGE_CACHE, MAX_PAGES);
	} catch (err) {
		const cache = await caches.open(PAGE_CACHE);
		return (await cache.match(OFFLINE_URL)) || Response.error();
	}
}

async function handleGraphql(request) {
	const body = await request.clone().text();
	// Faqat query keshlanadi; mutation va fayl yuklash (multipart) to'g'ridan-to'g'ri tarmoqqa
	const isQuery = request.headers.get('content-type')?.includes('application/json') && !/"query"\s*:\s*"\s*mutation\b/.test(body);
	if (!isQuery) return fetch(request);

	// Access token har soatda yangilanadi — kalitga token emas, undagi user _id kiradi
	const key = new Request(`https://${API_HOST}/__sw_graphql/${await sha256(body + tokenOwner(request))}`);
	return networkFirst(request, API_CACHE, MAX_API, key);
}

async function networkFirst(request, cacheName, maxEntries, key = request) {
	const cache = await caches.open(cacheName);
	const network = fetch(request).then(async (response) => {
		if (response.ok) {
			await cache.put(key, response.clone());
			trim(cache, maxEntries);
		}
		return response;
	});
	network.catch(() => undefined);
	try {
		return await withTimeout(network, NETWORK_TIMEOUT_MS);
	} catch (err) {
		// Sekin tarmoqda kesh bo'lsa uni beramiz, bo'lmasa tarmoqni kutishda davom etamiz
		const cached = await cache.match(key);
		if (cached) return cached;
		return network;
	}
}

async function cacheFirst(request, cacheName, maxEntries) {
	const cache = await caches.open(cacheName);
	const cached = await cache.match(request);
	if (cached) return cached;
	const response = await fetch(request);
	if (response.ok || response.type === 'opaque') {
		await cache.put(request, response.clone());
		if (maxEntries) trim(cache, maxEntries);
	}
	return response;
}

async function trim(cache, maxEntries) {
	const keys = await cache.keys();
	const extra = keys.length - maxEntries;
	for (let i = 0; i < extra; i++) {
		if (keys[i].url.endsWith(OFFLINE_URL)) continue;
		await cache.delete(keys[i]);
	}
}

function withTimeout(promise, ms) {
	return new Promise((resolve, reject) => {
		const timer = setTimeout(() => reject(new Error('timeout')), ms);
		promise.then(
			(value) => {
				clearTimeout(timer);
				resolve(value);
			},
			(err) => {
				clearTimeout(timer);
				reject(err);
			},
		);
	});
}

function tokenOwner(request) {
	const auth = request.headers.get('authorization') || '';
	const payload = auth.replace(/^Bearer\s+/i, '').split('.')[1];
	if (!payload) return 'guest';
	try {
		return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))._id || 'guest';
	} catch (err) {
		return 'guest';
	}
}

async function sha256(text) {
	const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
	return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}
