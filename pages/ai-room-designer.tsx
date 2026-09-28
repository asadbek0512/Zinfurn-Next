import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import withLayoutBasic from '../libs/components/layout/LayoutBasic';
import AiRoomDesigner from '../libs/components/aiRoomDesigner/AiRoomDesigner';
import { LocaleContext, DEFAULT_LOCALE } from '../libs/types/common';

export const getStaticProps = async ({ locale }: LocaleContext) => ({
	props: {
		...(await serverSideTranslations(locale ?? DEFAULT_LOCALE, ['common'])),
	},
});

const AiRoomDesignerPage = () => {
	return <AiRoomDesigner />;
};

export default withLayoutBasic(AiRoomDesignerPage);
