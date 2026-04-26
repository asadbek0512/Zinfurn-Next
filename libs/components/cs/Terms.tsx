import React from 'react';
import { Box, Stack, Typography } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import ArticleIcon from '@mui/icons-material/Article';
import { useQuery } from '@apollo/client';
import { GET_ALL_NOTICES } from '../../../apollo/user/query';
import { NoticeCategory, NoticeStatus } from '../../enums/notice.enum';
import CircularProgress from '@mui/material/CircularProgress';
import { useTranslation } from 'next-i18next';

const Terms = () => {
	const { t } = useTranslation('common');
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
		if (loading) return <div className="mob-cs-loading"><CircularProgress size={28} sx={{ color: '#cf6422' }} /></div>;
		const terms = termsData?.getAllNotices?.list.slice().reverse() || [];
		return (
			<div className="mob-cs-terms">
				{terms.length === 0 && <p className="mob-cs-empty">{t('No terms yet')}</p>}
				{terms.map((term: any, index: number) => (
					<div key={term._id} className="mob-cs-terms-card">
						<div className="mob-cs-terms-top">
							<ArticleIcon sx={{ color: '#cf6422', fontSize: 18, flexShrink: 0 }} />
							<span className="mob-cs-terms-title">{term.noticeTitle}</span>
						</div>
						<p className="mob-cs-terms-body">{term.noticeContent}</p>
					</div>
				))}
			</div>
		);
	}

	if (loading) {
		return (
			<Box component="div" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
				<CircularProgress />
			</Box>
		);
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
					backgroundColor: '#ffffff',
					borderRadius: '12px',
					border: '1px solid #E2E8F0',
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
								backgroundColor: '#F8FAFC',
								borderBottom: '1px solid #E2E8F0',
							}}
						>
							<ArticleIcon sx={{ color: '#ff6b35' }} />
							<Typography sx={{ color: '#1E293B', fontWeight: 600, fontSize: '1.1rem' }}>{term.noticeTitle}</Typography>
						</Box>
						<Box component="div" sx={{ p: 3, borderBottom: index < terms.length - 1 ? '1px solid #E2E8F0' : 'none' }}>
							<Typography sx={{ color: '#64748B', lineHeight: 1.8 }}>{term.noticeContent}</Typography>
						</Box>
					</Box>
				))}
			</Box>
		</Stack>
	);
};

export default Terms;
