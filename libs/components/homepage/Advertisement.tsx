import { Stack, Typography, Box, Button } from '@mui/material';
import HandymanIcon from '@mui/icons-material/Handyman';
import HomeRepairServiceIcon from '@mui/icons-material/HomeRepairService';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next'; // <-- Tarjima uchun import
import useDeviceDetect from '../../hooks/useDeviceDetect';

export default function InnovationSection() {
	const router = useRouter();
	const device = useDeviceDetect();

	const { t } = useTranslation('common'); // <-- Tarjima funksiyasi

	const handleNavigate = () => {
		router.push('/repairService');
	};

	if (device === 'mobile') {
		return (
			<Box component="section" sx={{ background: '#f8f7f4', py: 4 }}>
				<Box component="div" className="container">
					<Stack spacing={3} className="mobileContent" alignItems="center">
						{/* Rasm */}
						<Box component="div" className="mobileImageContainer">
							<img src="/img/banner/usta.jpg" alt="Craftsman repairing furniture" className="mobileImage" />
						</Box>

						{/* Iconlar */}
						<Stack direction="row" spacing={1} className="mobileIcons" justifyContent="center">
							<HandymanIcon color="primary" />
							<HomeRepairServiceIcon color="secondary" />
						</Stack>

						{/* Sarlavha */}
						<Typography variant="h5" component="h2" textAlign="center">
							{t('Repair Services')}
						</Typography>

						{/* Matn */}
						<Typography variant="body2" textAlign="center">
							{t(
								"We don't just build — we repair. Our skilled craftsmen bring new life to broken furniture. Explore our service page to view repaired items and find expert technicians ready to help.",
							)}
						</Typography>

						{/* Tugma */}
						<Button variant="contained" onClick={handleNavigate}>
							{t('Explore Repair Service')}
						</Button>
					</Stack>
				</Box>
			</Box>
		);
	} else {
		return (
			<Box component="section" sx={{ background: '#f8f7f4', py: 6 }}>
				<Box component={'div'} className="container">
					<Stack direction={{ xs: 'column', md: 'row' }} spacing={4} className="contentWrapper">
						<Box component={'div'} className="imageContainer">
							<img src="/img/banner/usta.jpg" alt="Craftsman repairing furniture" className="image" />
						</Box>

						<Stack spacing={2} className="textContent">
							<Box component={'div'} className="iconContainer" sx={{ display: 'flex', gap: 1 }}>
								<HandymanIcon className="con" color="primary" />
								<HomeRepairServiceIcon className="con" color="secondary" />
							</Box>

							<Typography variant="h4" component="h2" className="heading">
								{t('Repair Services')} {/* <-- Tarjima qilinadigan */}
							</Typography>

							<Typography variant="body1" className="paragraph">
								{t(
									"We don't just build — we repair. Our skilled craftsmen bring new life to broken furniture. Explore our service page to view repaired items and find expert technicians ready to help.",
								)}{' '}
								{/* <-- Tarjima qilinadigan */}
							</Typography>

							<Button className="repairButton" onClick={handleNavigate}>
								{t('Explore Repair Service')} {/* <-- Tarjima qilinadigan */}
							</Button>
						</Stack>
					</Stack>
				</Box>
			</Box>
		);
	}
}
