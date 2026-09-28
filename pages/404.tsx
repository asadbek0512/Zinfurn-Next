import React from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import { Stack, Typography, Button } from '@mui/material';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import withLayoutFull from '../libs/components/layout/LayoutFull';
import SEO from '../libs/components/common/SEO';
import { LocaleContext, DEFAULT_LOCALE } from '../libs/types/common';

export const getStaticProps = async ({ locale }: LocaleContext) => ({
	props: {
		...(await serverSideTranslations(locale ?? DEFAULT_LOCALE, ['common'])),
	},
});

const NotFound: NextPage = () => {
	const { t } = useTranslation('common');

	return (
		<>
			<SEO title={t('404_title')} noindex />
			<Stack className={'not-found-page'}>
				<span className={'not-found-code'}>404</span>
				<Typography variant={'h4'} className={'not-found-title'}>
					{t('404_title')}
				</Typography>
				<Typography className={'not-found-desc'}>{t('404_desc')}</Typography>
				<Stack direction={{ xs: 'column', sm: 'row' }} className={'not-found-actions'}>
					<Link href={'/'}>
						<Button variant={'contained'} className={'not-found-btn-primary'}>
							{t('404_go_home')}
						</Button>
					</Link>
					<Link href={'/products'}>
						<Button variant={'outlined'} className={'not-found-btn-secondary'}>
							{t('404_browse_property')}
						</Button>
					</Link>
				</Stack>
			</Stack>
		</>
	);
};

export default withLayoutFull(NotFound);
