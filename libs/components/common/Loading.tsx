import React from 'react';
import { CircularProgress, Stack, Typography } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';

interface LoadingProps {
	text?: string;
	fullScreen?: boolean;
}

const Loading = ({ text, fullScreen }: LoadingProps) => {
	const device = useDeviceDetect();

	return (
		<Stack
			sx={{
				justifyContent: 'center',
				alignItems: 'center',
				width: '100%',
				height: fullScreen ? '100vh' : device === 'mobile' ? '300px' : '600px',
				transition: 'all 0.3s ease',
			}}
		>
			<CircularProgress
				size={device === 'mobile' ? '2.5rem' : '4rem'}
				sx={{
					color: '#cf6422',
					mb: 2,
				}}
			/>
			{text && (
				<Typography
					variant={device === 'mobile' ? 'body2' : 'body1'}
					color="text.secondary"
					sx={{ fontWeight: 500, letterSpacing: '0.5px' }}
				>
					{text}
				</Typography>
			)}
		</Stack>
	);
};

export default Loading;
