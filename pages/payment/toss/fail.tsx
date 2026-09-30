import React from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Button, Typography } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { TOSS_USER_CANCEL } from '../../../libs/payment/toss';
import { LocaleContext, DEFAULT_LOCALE } from '../../../libs/types/common';

export const getStaticProps = async ({ locale }: LocaleContext) => ({
	props: {
		...(await serverSideTranslations(locale ?? DEFAULT_LOCALE, ['common'])),
	},
});

/** Toss xato yoki bekor qilishda shu yerga qaytaradi: ?code&message&orderId */
const TossFail: NextPage = () => {
	const { t } = useTranslation('common');
	const { code, message } = useRouter().query;
	const cancelled = code === TOSS_USER_CANCEL;

	return (
		<div className="co-guard">
			<ErrorOutlineIcon className="co-guard-icon" />
			<Typography className="co-guard-title">{cancelled ? t('Payment was cancelled') : t('Payment failed')}</Typography>
			{!cancelled && typeof message === 'string' && (
				<Typography className="co-guard-sub">
					{message}
					{typeof code === 'string' && ` (${code})`}
				</Typography>
			)}
			<Link href="/checkout"><Button variant="contained" className="co-guard-btn">{t('Back to checkout')}</Button></Link>
		</div>
	);
};

export default TossFail;
