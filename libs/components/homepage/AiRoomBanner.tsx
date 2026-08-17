import { Box, Stack, Typography, Button, Tooltip } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import ViewInArIcon from '@mui/icons-material/ViewInAr';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import useDeviceDetect from '../../hooks/useDeviceDetect';

const AI_ROOM_DESIGNER_PATH = '/ai-room-designer';

export default function AiRoomBanner() {
	const router = useRouter();
	const device = useDeviceDetect();
	const { t } = useTranslation('common');

	const handleImageFlow = () => {
		router.push(AI_ROOM_DESIGNER_PATH);
	};

	return (
		<Box component="section" className="ai-room-banner">
			<Box className="content">
				<Box className="iconBadge">
					<AutoAwesomeIcon className="sparkle" />
				</Box>

				<Typography variant={device === 'mobile' ? 'h6' : 'h4'} component="h2" className="heading">
					{t('AI bilan xonangizga mos mebel toping')}
				</Typography>

				<Typography variant="body2" className="subtext">
					{t('Rasm yuklang — AI xonangizga eng mos mebillarni tavsiya qiladi')}
				</Typography>

				<Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} className="actions">
					<Button
						variant="contained"
						className="primaryAction"
						startIcon={<PhotoCameraIcon />}
						onClick={handleImageFlow}
					>
						{t('Rasm orqali tanlash')}
					</Button>

					<Tooltip title={t('Bu funksiya hozircha tayyorlanmoqda')}>
						<span>
							<Button variant="outlined" className="secondaryAction" startIcon={<ViewInArIcon />} disabled>
								{t('AR bilan ko\'rish')} · {t('Tez orada')}
							</Button>
						</span>
					</Tooltip>
				</Stack>
			</Box>
		</Box>
	);
}
