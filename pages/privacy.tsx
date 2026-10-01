import React from 'react';
import { NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import withLayoutBasic from '../libs/components/layout/LayoutBasic';
import LegalPage from '../libs/components/legal/LegalPage';
import { PRIVACY_CONTENT } from '../libs/components/legal/legalContent';
import { LocaleContext, DEFAULT_LOCALE } from '../libs/types/common';

export const getStaticProps = async ({ locale }: LocaleContext) => ({
	props: {
		...(await serverSideTranslations(locale ?? DEFAULT_LOCALE, ['common'])),
	},
});

const Privacy: NextPage = () => <LegalPage content={PRIVACY_CONTENT} path="/privacy" />;

export default withLayoutBasic(Privacy);
