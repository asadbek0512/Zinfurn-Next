import React from 'react';
import { useQuery } from '@apollo/client';
import { Chip } from '@mui/material';
import AndroidIcon from '@mui/icons-material/Android';
import { GET_APP_STATS } from '../../../../apollo/admin/query';

type AppStat = { platform: string; downloads: number; updatedAt?: string };
type AppStatsData = { getAppStats: AppStat[] };

const ANDROID = 'ANDROID';

/** Admin: Android APK necha marta yuklab olingani (/api/app-download sanaydi) */
const AppDownloadStats = () => {
	const { data } = useQuery<AppStatsData>(GET_APP_STATS, { fetchPolicy: 'network-only' });
	const android = data?.getAppStats.find((stat) => stat.platform === ANDROID);

	return (
		<Chip
			icon={<AndroidIcon />}
			label={`App downloads: ${android?.downloads ?? 0}`}
			variant={'outlined'}
			title={android?.updatedAt ? `Last: ${new Date(android.updatedAt).toLocaleString()}` : undefined}
		/>
	);
};

export default AppDownloadStats;
