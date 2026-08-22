import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { PropertyCategory } from '../libs/enums/property.enum';
import { resolveArModel } from '../libs/config/arModels';

// <model-viewer> registers a custom element on import, so it must stay out of the SSR bundle
const ArModelViewer = dynamic(() => import('../libs/components/ar/ArModelViewer'), { ssr: false });

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const ArViewPage = () => {
	const router = useRouter();
	const { model, title, category, src, poster } = router.query;

	const initialModelId =
		typeof model === 'string'
			? model
			: resolveArModel(typeof title === 'string' ? title : undefined, category as PropertyCategory | undefined).id;

	return (
		<ArModelViewer
			initialModelId={initialModelId}
			modelUrl={typeof src === 'string' ? src : undefined}
			productTitle={typeof title === 'string' ? title : undefined}
			posterUrl={typeof poster === 'string' ? poster : undefined}
			onClose={() => router.back()}
		/>
	);
};

export default ArViewPage;
