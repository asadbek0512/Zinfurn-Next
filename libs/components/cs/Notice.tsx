import React from 'react';
import { Stack, Box, Typography } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { format } from 'date-fns';
import { useQuery } from '@apollo/client';
import { GET_ALL_NOTICES } from '../../../apollo/user/query';
import { NoticeCategory, NoticeStatus } from '../../enums/notice.enum';
import CircularProgress from '@mui/material/CircularProgress';
import Loading from '../common/Loading';
import { useTranslation } from 'next-i18next';

const Notice = () => {
	const { t } = useTranslation('common');
	const device = useDeviceDetect();

	const { data: noticesData, loading } = useQuery(GET_ALL_NOTICES, {
		variables: {
			input: {
				noticeCategory: NoticeCategory.NOTICE,
				noticeStatus: NoticeStatus.ACTIVE,
			},
		},
	});

	if (device === 'mobile') {
		if (loading) return <Loading />;
		const notices = noticesData?.getAllNotices?.list.slice().reverse() || [];
		return (
			<div className="mob-cs-notice">
				{notices.length === 0 && <p className="mob-cs-empty">{t('No notices yet')}</p>}
				{notices.map((notice: any, index: number) => (
					<div key={notice._id} className="mob-cs-notice-card">
						<div className="mob-cs-notice-top">
							<NotificationsIcon sx={{ color: '#cf6422', fontSize: 18, flexShrink: 0 }} />
							<span className="mob-cs-notice-title">{notice.noticeTitle}</span>
							<span className="mob-cs-notice-date">{format(new Date(notice.createdAt), 'MMM dd')}</span>
						</div>
						<p className="mob-cs-notice-body">{notice.noticeContent}</p>
					</div>
				))}
			</div>
		);
	}

	if (loading) {
		return <Loading />;
	}

	const notices = noticesData?.getAllNotices?.list.slice().reverse() || [];

	return (
		<Stack className={'notice-content'}>
			<Box component="div" sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
				<Typography variant="h4" component="h1" className={'title'} sx={{ mb: 0 }}>
					{t('Notice')}
				</Typography>
				<Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
					{t('Stay updated with our latest announcements and news')}
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
				{notices.map((notice: any, index: number) => (
					<Box component="div" key={notice._id}>
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
							<NotificationsIcon sx={{ color: '#ff6b35' }} />
							<Typography sx={{ color: '#1E293B', fontWeight: 600, fontSize: '1.1rem', flex: 1 }}>
								{notice.noticeTitle}
							</Typography>
							<Typography sx={{ color: '#64748B', fontSize: '0.9rem' }}>
								{format(new Date(notice.createdAt), 'MMM dd, yyyy')}
							</Typography>
						</Box>
						<Box component="div" sx={{ p: 3, borderBottom: index < notices.length - 1 ? '1px solid #E2E8F0' : 'none' }}>
							<Typography sx={{ color: '#64748B', lineHeight: 1.8 }}>{notice.noticeContent}</Typography>
						</Box>
					</Box>
				))}
			</Box>
		</Stack>
	);
};

export default Notice;
