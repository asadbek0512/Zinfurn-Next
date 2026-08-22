import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { PropertyCategory } from '../libs/enums/property.enum';
import { resolveArModel } from '../libs/config/arModels';

// three.js touches `window` at import time, so it must stay out of the SSR bundle
const ArViewer = dynamic(() => import('../libs/components/ar/ArViewer'), { ssr: false });

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const ArViewPage = () => {
	const router = useRouter();
	const { model, title, category } = router.query;

	const initialModelId =
		typeof model === 'string'
			? model
			: resolveArModel(typeof title === 'string' ? title : undefined, category as PropertyCategory | undefined).id;

	return <ArViewer initialModelId={initialModelId} onClose={() => router.back()} />;
};

export default ArViewPage;
