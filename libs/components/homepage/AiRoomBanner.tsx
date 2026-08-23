import { Box, Stack, Typography, Button } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import ViewInArIcon from '@mui/icons-material/ViewInAr';
import ChairIcon from '@mui/icons-material/Chair';
import WeekendIcon from '@mui/icons-material/Weekend';
import TableRestaurantIcon from '@mui/icons-material/TableRestaurant';
import BedIcon from '@mui/icons-material/Bed';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import useDeviceDetect from '../../hooks/useDeviceDetect';

const AI_ROOM_DESIGNER_PATH = '/ai-room-designer';
const AR_VIEW_PATH = '/ar-view';

const ORBIT_ICONS = [
	{ Icon: ChairIcon, cls: 'orbit-1' },
	{ Icon: WeekendIcon, cls: 'orbit-2' },
	{ Icon: TableRestaurantIcon, cls: 'orbit-3' },
	{ Icon: BedIcon, cls: 'orbit-4' },
];

export default function AiRoomBanner() {
	const router = useRouter();
	const device = useDeviceDetect();
	const { t } = useTranslation('common');

	const handleImageFlow = () => {
		router.push(AI_ROOM_DESIGNER_PATH);
	};

	const handleArFlow = () => {
		router.push(AR_VIEW_PATH);
	};

	return (
		<Box component="section" className="ai-room-banner-section">
			<Box className="container">
				<Box className="ai-room-banner">
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

						<Stack direction="row" spacing={2} className="actions">
							<Button
								variant="contained"
								className="primaryAction"
								startIcon={<PhotoCameraIcon />}
								onClick={handleImageFlow}
							>
								{t('Rasm orqali tanlash')}
							</Button>

							<span className="secondaryAction-wrap">
								<Button
									variant="outlined"
									className="secondaryAction"
									startIcon={<ViewInArIcon />}
									onClick={handleArFlow}
								>
									{t('AR bilan ko\'rish')}
								</Button>
							</span>
						</Stack>
					</Box>

					<Box className="visual" aria-hidden="true">
						<Box className="visual-ring visual-ring--outer" />
						<Box className="visual-ring visual-ring--inner" />
						<Box className="visual-core">
							<AutoAwesomeIcon className="visual-core-icon" />
						</Box>
						{ORBIT_ICONS.map(({ Icon, cls }, idx) => (
							<Box key={idx} className={`orbit-icon ${cls}`}>
								<Icon />
							</Box>
						))}
					</Box>
				</Box>
			</Box>
		</Box>
	);
}
