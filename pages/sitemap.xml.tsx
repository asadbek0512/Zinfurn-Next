import { GetServerSideProps } from 'next';

const SITE_URL = 'https://zinfurn.uz';

const staticPages = [
	{ url: '/', priority: '1.0', changefreq: 'daily' },
	{ url: '/property', priority: '0.9', changefreq: 'daily' },
	{ url: '/agent', priority: '0.8', changefreq: 'weekly' },
	{ url: '/repairService', priority: '0.7', changefreq: 'weekly' },
	{ url: '/community', priority: '0.7', changefreq: 'daily' },
	{ url: '/cs', priority: '0.5', changefreq: 'monthly' },
];

function SitemapXML() {
	return null;
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
	const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages
	.map(
		({ url, priority, changefreq }) => `  <url>
    <loc>${SITE_URL}${url}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </url>`,
	)
	.join('\n')}
</urlset>`;

	res.setHeader('Content-Type', 'application/xml');
	res.write(sitemap);
	res.end();

	return { props: {} };
};

export default SitemapXML;
