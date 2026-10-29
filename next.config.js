/** @type {import('next').NextConfig} */

// Xavfsizlik headerlari middleware.ts da o'rnatiladi — statik/keshlangan (SSG)
// sahifalarga ham qo'llanishi uchun (next.config headers() SSG'da ishonchsiz).

const nextConfig = {
	// Pre-push hook build'i alohida papkaga boradi — dev serverning .next'i buzilmaydi
	distDir: process.env.NEXT_DIST_DIR || '.next',
	poweredByHeader: false,
	eslint: { ignoreDuringBuilds: true },
	typescript: { ignoreBuildErrors: true },
	reactStrictMode: true,
	// Map'lar faqat Sentry'ga yuklash uchun — postbuild ularni yuklab, o'chiradi
	productionBrowserSourceMaps: !!process.env.SENTRY_AUTH_TOKEN,
	compiler: {
		removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error'] } : false,
	},
	// Yuklangan rasmlar (api /uploads) kartalarda /_next/image orqali kichraytirilib beriladi
	// (libs/utils/imageUrl.ts). Fayl nomlari UUID — o'zgarmaydi, shuning uchun uzoq keshlanadi.
	images: {
		remotePatterns: [new URL(process.env.REACT_APP_API_URL || 'http://localhost:3007')].map((u) => ({
			protocol: u.protocol.replace(':', ''),
			hostname: u.hostname,
			port: u.port,
			pathname: '/uploads/**',
		})),
		formats: ['image/webp'],
		minimumCacheTTL: 60 * 60 * 24 * 30,
	},
	experimental: {
		optimizePackageImports: ['@mui/material', '@mui/icons-material', '@mui/lab'],
	},
	// /property /products ga ko'chirildi — eski havolalar buzilmasligi uchun
	// Apple universal links fayli kengaytmasiz — JSON deb berilmasa iOS uni o'qimaydi
	async headers() {
		return [{ source: '/.well-known/apple-app-site-association', headers: [{ key: 'Content-Type', value: 'application/json' }] }];
	},
	async redirects() {
		return [
			{ source: '/property', destination: '/products', permanent: true },
			{ source: '/property/:path*', destination: '/products/:path*', permanent: true },
			{ source: '/_admin/properties', destination: '/_admin/products', permanent: true },
		];
	},
	env: {
		REACT_APP_API_URL: process.env.REACT_APP_API_URL,
		REACT_APP_API_GRAPHQL_URL: process.env.REACT_APP_API_GRAPHQL_URL,
		REACT_APP_API_WS: process.env.REACT_APP_API_WS,
	},
};

const { i18n } = require('./next-i18next.config');
nextConfig.i18n = i18n;

module.exports = nextConfig;
