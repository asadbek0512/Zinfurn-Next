import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import withLayoutBasic from '../libs/components/layout/LayoutBasic';
import AiRoomDesigner from '../libs/components/aiRoomDesigner/AiRoomDesigner';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const AiRoomDesignerPage = () => {
	return <AiRoomDesigner />;
};

export default withLayoutBasic(AiRoomDesignerPage);
