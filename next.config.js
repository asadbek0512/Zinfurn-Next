/** @type {import('next').NextConfig} */

// Xavfsizlik headerlari middleware.ts da o'rnatiladi — statik/keshlangan (SSG)
// sahifalarga ham qo'llanishi uchun (next.config headers() SSG'da ishonchsiz).

const nextConfig = {
	poweredByHeader: false,
	eslint: { ignoreDuringBuilds: true },
	typescript: { ignoreBuildErrors: true },
	reactStrictMode: true,
	compiler: {
		removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error'] } : false,
	},
	experimental: {
		optimizePackageImports: ['@mui/material', '@mui/icons-material', '@mui/lab'],
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
