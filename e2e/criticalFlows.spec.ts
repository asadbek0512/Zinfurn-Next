import { expect, Page, test } from '@playwright/test';

/**
 * Asosiy oqimlar: savat → checkout va login.
 * Prod'da ham xavfsiz — buyurtma yaratilmaydi, akkaunt ochilmaydi.
 * Login bilan checkout testi faqat E2E_USER / E2E_PASS berilganda ishlaydi.
 */

const PRODUCT_ID = process.env.E2E_PRODUCT_ID || '698361fdf6435b9515da8e7a';
const E2E_USER = process.env.E2E_USER;
const E2E_PASS = process.env.E2E_PASS;

const CART_STORAGE_KEY = 'zinfurn_cart';
const TOKEN_STORAGE_KEY = 'accessToken';
const WRONG_PASSWORD = 'e2e-wrong-password-000';
const UNKNOWN_USER = 'e2e-no-such-user@zinfurn.uz';
/** SalePromoModal shu prefiksli sessionStorage kalitini ko'rsa popup chiqarmaydi (kalit oxirida user id) */
const PROMO_SESSION_KEY_PREFIX = 'zin_promo_session_shown_';

type StoredCartItem = { product: { _id: string }; quantity: number };

const readCart = (page: Page): Promise<StoredCartItem[]> =>
	page.evaluate((key) => JSON.parse(localStorage.getItem(key) || '[]'), CART_STORAGE_KEY);

const addProductToCart = async (page: Page) => {
	await page.goto(`/products/detail?id=${PRODUCT_ID}`, { waitUntil: 'networkidle' });
	const addBtn = page.locator('.mob-det-cart-btn');
	await expect(addBtn).toBeEnabled();
	await addBtn.click();
	await expect.poll(async () => (await readCart(page)).map((i) => i.product._id)).toContain(PRODUCT_ID);
};

const login = async (page: Page, user: string, pass: string) => {
	await page.goto('/account/join', { waitUntil: 'networkidle' });
	await page.locator('.mob-join-form input').first().fill(user);
	await page.locator('.mob-join-form input[type="password"]').first().fill(pass);
	await page.locator('.mob-join-btn').first().click();
};

// Sale popup tugmalarni to'sib qo'ymasin — har sessiyada "allaqachon ko'rsatilgan" deb turadi
test.beforeEach(async ({ page }) => {
	await page.addInitScript((prefix) => {
		const original = Storage.prototype.getItem;
		Storage.prototype.getItem = function (key: string) {
			return key.startsWith(prefix) ? '1' : original.call(this, key);
		};
	}, PROMO_SESSION_KEY_PREFIX);
});

test.describe('savat → checkout', () => {
	test('mahsulot savatga tushadi va drawer orqali checkout ochiladi', async ({ page }) => {
		await addProductToCart(page);

		await page.locator('.cart-nav-btn:visible').first().click();
		const item = page.locator('.cart-drawer-item');
		await expect(item).toHaveCount(1);

		await page.locator('.cart-checkout-link').click();
		await expect(page).toHaveURL(/\/checkout/);
	});

	test('savat reload qilinganda saqlanib qoladi', async ({ page }) => {
		await addProductToCart(page);
		await page.reload({ waitUntil: 'networkidle' });
		expect((await readCart(page)).map((i) => i.product._id)).toContain(PRODUCT_ID);
	});

	test('mehmon checkout ochsa login so\'raladi', async ({ page }) => {
		await addProductToCart(page);
		await page.goto('/checkout', { waitUntil: 'networkidle' });
		await expect(page.locator('.co-guard')).toBeVisible();
		await expect(page.locator('.co-guard a[href="/account/join"]')).toBeVisible();
		await expect(page.locator('.co-step')).toHaveCount(0);
	});
});

test.describe('login', () => {
	test('maydonlar bo\'sh bo\'lsa Sign In tugmasi o\'chiq', async ({ page }) => {
		await page.goto('/account/join', { waitUntil: 'networkidle' });
		await expect(page.locator('.mob-join-btn').first()).toBeDisabled();
	});

	test('noto\'g\'ri parol bilan kirib bo\'lmaydi', async ({ page }) => {
		await login(page, UNKNOWN_USER, WRONG_PASSWORD);
		await expect(page.locator('.swal2-popup')).toBeVisible();
		await expect(page).toHaveURL(/\/account\/join/);
		expect(await page.evaluate((key) => localStorage.getItem(key), TOKEN_STORAGE_KEY)).toBeNull();
	});

	test('to\'g\'ri login → checkout formasi ochiladi', async ({ page }) => {
		test.skip(!E2E_USER || !E2E_PASS, 'E2E_USER / E2E_PASS berilmagan');
		await login(page, E2E_USER as string, E2E_PASS as string);
		await expect.poll(() => page.evaluate((key) => localStorage.getItem(key), TOKEN_STORAGE_KEY)).not.toBeNull();

		await addProductToCart(page);
		await page.goto('/checkout', { waitUntil: 'networkidle' });
		await expect(page.locator('.co-guard')).toHaveCount(0);
		await expect(page.locator('.co-step')).toBeVisible();
		await expect(page.locator('.co-sum-item')).toHaveCount(1);
	});
});
