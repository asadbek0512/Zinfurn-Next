import { Stack, Typography, Box, Button } from '@mui/material';
import HandymanIcon from '@mui/icons-material/Handyman';
import HomeRepairServiceIcon from '@mui/icons-material/HomeRepairService';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next'; // <-- Tarjima uchun import

export default function InnovationSection() {
	const router = useRouter();
	const { t } = useTranslation('common'); // <-- Tarjima funksiyasi

	const handleNavigate = () => {
		router.push('/repairService');
	};

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
							{t("Repair Services")} {/* <-- Tarjima qilinadigan */}
						</Typography>

						<Typography variant="body1" className="paragraph">
							{t("We don't just build — we repair. Our skilled craftsmen bring new life to broken furniture. Explore our service page to view repaired items and find expert technicians ready to help.")} {/* <-- Tarjima qilinadigan */}
						</Typography>

						<Button className="repairButton" onClick={handleNavigate}>
							{t("Explore Repair Service")} {/* <-- Tarjima qilinadigan */}
						</Button>
					</Stack>
				</Stack>
			</Box>
		</Box>
	);
}