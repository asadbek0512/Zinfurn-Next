import React from 'react';
import { NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import withLayoutBasic from '../libs/components/layout/LayoutBasic';
import LegalPage from '../libs/components/legal/LegalPage';
import { TERMS_CONTENT } from '../libs/components/legal/legalContent';
import { LocaleContext, DEFAULT_LOCALE } from '../libs/types/common';

export const getStaticProps = async ({ locale }: LocaleContext) => ({
	props: {
		...(await serverSideTranslations(locale ?? DEFAULT_LOCALE, ['common'])),
	},
});

const Terms: NextPage = () => <LegalPage content={TERMS_CONTENT} path="/terms" />;

export default withLayoutBasic(Terms);
