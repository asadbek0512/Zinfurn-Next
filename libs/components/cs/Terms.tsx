import React from 'react';
import { Box, Stack, Typography } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import ArticleIcon from '@mui/icons-material/Article';
import { useQuery } from '@apollo/client';
import { GET_ALL_NOTICES } from '../../../apollo/user/query';
import { NoticeCategory, NoticeStatus } from '../../enums/notice.enum';
import CircularProgress from '@mui/material/CircularProgress';
import Loading from '../common/Loading';
import { useTranslation } from 'next-i18next';
import { getLocalizedNoticeTitle, getLocalizedNoticeContent } from '../../utils/localizeNotice';

const Terms = () => {
	const { t, i18n } = useTranslation('common');
	const device = useDeviceDetect();

	const { data: termsData, loading } = useQuery(GET_ALL_NOTICES, {
		variables: {
			input: {
				noticeCategory: NoticeCategory.TERMS,
				noticeStatus: NoticeStatus.ACTIVE,
			},
		},
	});

	if (device === 'mobile') {
		if (loading) return <Loading />;
		const terms = termsData?.getAllNotices?.list.slice().reverse() || [];
		return (
			<div className="mob-cs-terms">
				{terms.length === 0 && <p className="mob-cs-empty">{t('No terms yet')}</p>}
				{terms.map((term: any, index: number) => (
					<div key={term._id} className="mob-cs-terms-card">
						<div className="mob-cs-terms-top">
							<ArticleIcon sx={{ color: 'var(--primary)', fontSize: 18, flexShrink: 0 }} />
							<span className="mob-cs-terms-title">{getLocalizedNoticeTitle(term, i18n.language)}</span>
						</div>
						<p className="mob-cs-terms-body">{getLocalizedNoticeContent(term, i18n.language)}</p>
					</div>
				))}
			</div>
		);
	}

	if (loading) {
		return <Loading />;
	}

	const terms = termsData?.getAllNotices?.list.slice().reverse() || [];

	return (
		<Stack className={'terms-content'}>
			<Box component="div" sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
				<Typography variant="h4" component="h1" className={'title'} sx={{ mb: 0 }}>
					{t('Terms & Conditions')}
				</Typography>
				<Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
					{t('Please read our terms and conditions carefully')}
				</Typography>
			</Box>

			<Box
				component="div"
				sx={{
					backgroundColor: 'var(--surface)',
					borderRadius: '12px',
					border: '1px solid var(--border-soft)',
					overflow: 'hidden',
				}}
			>
				{terms.map((term: any, index: number) => (
					<Box component="div" key={term._id}>
						<Box
							component="div"
							sx={{
								display: 'flex',
								alignItems: 'center',
								gap: 2,
								p: 3,
								backgroundColor: 'var(--surface-2)',
								borderBottom: '1px solid var(--border-soft)',
							}}
						>
							<ArticleIcon sx={{ color: '#ff6b35' }} />
							<Typography sx={{ color: 'var(--text-1)', fontWeight: 600, fontSize: '1.1rem' }}>{getLocalizedNoticeTitle(term, i18n.language)}</Typography>
						</Box>
						<Box component="div" sx={{ p: 3, borderBottom: index < terms.length - 1 ? '1px solid #E2E8F0' : 'none' }}>
							<Typography sx={{ color: 'var(--text-2)', lineHeight: 1.8 }}>{getLocalizedNoticeContent(term, i18n.language)}</Typography>
						</Box>
					</Box>
				))}
			</Box>
		</Stack>
	);
};

export default Terms;
