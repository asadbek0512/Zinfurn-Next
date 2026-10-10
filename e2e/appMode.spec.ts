import { expect, Page, test } from '@playwright/test';

/**
 * Capacitor app rejimi (UA: ZinfurnApp) — asosiy sahifalar uchun smoke testlar:
 *  - sahifa JS xatosiz ochiladi va pastki navbar chiziladi
 *  - hech bir tugma pastki navbar ostida qolib ketmaydi (checkout Continue bug'i shunday edi)
 *  - internet uzilsa offline banner chiqadi
 */

/** Detail sahifa uchun mavjud mahsulot — boshqa bazada E2E_PRODUCT_ID bilan almashtiriladi */
const PRODUCT_ID = process.env.E2E_PRODUCT_ID || '698361fdf6435b9515da8e7a';

const PUBLIC_PAGES: string[] = [
	'/',
	'/products',
	`/products/detail?id=${PRODUCT_ID}`,
	'/agent',
	'/community',
	'/repairService',
	'/cs',
	'/account/join',
	'/order/tracking',
];

/** Hydration + birinchi GraphQL javoblari uchun */
const SETTLE_MS = 1500;
/** Uchinchi tomon skriptlari (analytics, reklama) xatolari testni yiqitmasin */
const IGNORED_ERRORS = [/ResizeObserver loop/, /Script error/];

const NAV_SELECTOR = 'nav.app-bottom-nav';

const openAppPage = async (page: Page, path: string): Promise<string[]> => {
	const errors: string[] = [];
	page.on('pageerror', (err) => {
		if (!IGNORED_ERRORS.some((re) => re.test(err.message))) errors.push(err.message);
	});
	await page.goto(path, { waitUntil: 'networkidle' });
	await page.waitForTimeout(SETTLE_MS);
	return errors;
};

/** Ko'rinib turgan, lekin markazi navbar tomonidan yopilgan tugmalar (navbar o'z tugmalari hisobga olinmaydi) */
const findButtonsHiddenByNav = (page: Page): Promise<string[]> =>
	page.evaluate((navSelector) => {
		const nav = document.querySelector(navSelector);
		if (!nav) return [];
		const navTop = nav.getBoundingClientRect().top;
		const buttons = Array.from(document.querySelectorAll<HTMLElement>('button, a[role="button"], [type="submit"]'));
		return buttons
			.filter((btn) => !nav.contains(btn))
			.filter((btn) => {
				const rect = btn.getBoundingClientRect();
				if (rect.width === 0 || rect.height === 0 || rect.bottom <= navTop || rect.top >= window.innerHeight) return false;
				// Sahifa bilan birga suriladigan tugmani foydalanuvchi scroll qilib ochadi — faqat fixed/sticky muammo
				let el: HTMLElement | null = btn;
				while (el && el !== document.body) {
					const pos = getComputedStyle(el).position;
					if (pos === 'fixed' || pos === 'sticky') {
						const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
						return !!hit && nav.contains(hit);
					}
					el = el.parentElement;
				}
				return false;
			})
			.map((btn) => (btn.textContent || btn.getAttribute('aria-label') || btn.className).trim().slice(0, 60));
	}, NAV_SELECTOR);

for (const path of PUBLIC_PAGES) {
	test(`app rejimi: ${path}`, async ({ page }) => {
		const errors = await openAppPage(page, path);
		expect(errors, 'sahifada JS xatosi').toEqual([]);
		await expect(page.locator('html')).toHaveAttribute('data-app', '1');
		await expect(page.locator(NAV_SELECTOR)).toBeVisible();
		expect(await findButtonsHiddenByNav(page), 'navbar ostida qolgan tugmalar').toEqual([]);
	});
}

test('internet uzilsa offline banner chiqadi', async ({ page, context }) => {
	await openAppPage(page, '/');
	await context.setOffline(true);
	await expect(page.locator('.offline-banner.is-offline')).toBeVisible();
	await context.setOffline(false);
	await expect(page.locator('.offline-banner.is-back')).toBeVisible();
});

/** Popup'i yo'q sahifa (LayoutFull) loader'da 8s osilib qolmasin — deep link / push'dan ochilganda ko'rinadi */
const BOOT_LOADER_MAX_MS = 5000;

for (const path of [`/products/detail?id=${PRODUCT_ID}`, '/order/tracking']) {
	test(`app loader tez yopiladi: ${path}`, async ({ page }) => {
		await page.goto(path);
		await expect(page.locator('#app-boot-loader')).toHaveCount(0, { timeout: BOOT_LOADER_MAX_MS });
	});
}
