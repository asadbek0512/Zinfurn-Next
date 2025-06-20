import React from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Box, Stack, Typography } from '@mui/material';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import Notice from '../../libs/components/cs/Notice';
import Faq from '../../libs/components/cs/Faq';
import Terms from '../../libs/components/cs/Terms';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import SupportIcon from '@mui/icons-material/Support';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import ArticleIcon from '@mui/icons-material/Article';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const CS: NextPage = (props: any) => {
	const { t } = useTranslation('common');
	const device = useDeviceDetect();
	const router = useRouter();
	const tab = router.query.tab ?? 'notice';

	const changeTabHandler = (tab: string) => {
		router.push(
			{
				pathname: '/cs',
				query: { tab: tab },
			},
			undefined,
			{ scroll: false },
		);
	};

	if (device === 'mobile') {
		return <h1>{t('CS PAGE MOBILE')}</h1>;
	}

	return (
		<div id="pc-wrap">
			<Stack className={'cs-page'}>
				<Stack className={'container'}>
					<Box component={'div'} className={'cs-main-info'}>
						<Box component={'div'} className={'info'}>
							<Typography component="span">{t('Customer Support')}</Typography>
							<Typography component="p">
								<Link href="/">{t('Home')}</Link> / {t('Help')}
							</Typography>
						</Box>

						<Box component={'div'} className={'btns'}>
							<div className={tab === 'notice' ? 'active' : ''} onClick={() => changeTabHandler('notice')}>
								<SupportIcon />
								{t('Notices & Updates')}
							</div>
							<div className={tab === 'faq' ? 'active' : ''} onClick={() => changeTabHandler('faq')}>
								<QuestionAnswerIcon />
								{t('FAQ')}
							</div>
							<div className={tab === 'terms' ? 'active' : ''} onClick={() => changeTabHandler('terms')}>
								<ArticleIcon />
								{t('Terms & Conditions')}
							</div>
						</Box>
					</Box>

					<Box component={'div'} className={'cs-content'}>
						{tab === 'notice' && <Notice />}
						{tab === 'faq' && <Faq />}
						{tab === 'terms' && <Terms />}
					</Box>
				</Stack>
			</Stack>
		</div>
	);
};

export default withLayoutBasic(CS);
