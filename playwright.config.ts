import { defineConfig, devices } from '@playwright/test';

/** Default: prod sayt (testlar faqat o'qiydi). Lokal: E2E_BASE_URL=http://localhost:3006 */
const BASE_URL = process.env.E2E_BASE_URL || 'https://zinfurn.uz';
/** Capacitor app shu UA belgisi bilan ochiladi — sayt app rejimini shundan biladi */
const APP_UA_TAG = 'ZinfurnApp/1.0';
const TEST_TIMEOUT_MS = 60_000;

export default defineConfig({
	testDir: './e2e',
	timeout: TEST_TIMEOUT_MS,
	retries: 1,
	reporter: [['list']],
	use: {
		baseURL: BASE_URL,
		screenshot: 'only-on-failure',
	},
	projects: [
		{
			name: 'android-app',
			use: {
				...devices['Galaxy S9+'],
				userAgent: `${devices['Galaxy S9+'].userAgent} ${APP_UA_TAG}`,
			},
		},
	],
});
