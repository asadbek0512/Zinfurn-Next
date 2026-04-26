import React from 'react';
import { NextPage } from 'next';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Stack, Typography } from '@mui/material';
import dynamic from 'next/dynamic';
import { useTranslation } from 'next-i18next';

const TuiEditor = dynamic(() => import('../community/Teditor'), { ssr: false });

const WriteArticle: NextPage = () => {
	const { t } = useTranslation('common');
	const device = useDeviceDetect();

	if (device === 'mobile') {
		return (
			<div id="mob-writearticle">
				<div className="mob-writearticle-header">
					<h2>{t('Write an Article')}</h2>
					<span>{t('Feel free to write your ideas!')}</span>
				</div>
				<div className="mob-writearticle-body">
					<TuiEditor />
				</div>
			</div>
		);
	} else
		return (
			<div id="write-article-page">
				<Stack className="main-title-box">
					<Stack className="right-box">
						<Typography className="main-title">{t('Write an Article')}</Typography>
						<Typography className="sub-title">{t('Feel free to write your ideas!')}</Typography>
					</Stack>
				</Stack>
				<TuiEditor />
			</div>
		);
};

export default WriteArticle;
