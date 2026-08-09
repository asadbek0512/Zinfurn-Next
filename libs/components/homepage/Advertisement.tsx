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
			<Box component="section" sx={{ background: 'var(--bg-warm)', py: 3, px: 1 }}>
				<div style={{
					display: 'flex', flexDirection: 'row', alignItems: 'center',
					borderTop: '8px solid var(--primary)', borderBottom: '8px solid var(--primary)',
					borderLeft: '8px solid var(--primary)', borderRight: 'none',
					borderRadius: '24px 0 0 24px', gap: '0',
					background: 'var(--bg-warm)', overflow: 'hidden'
				}}>
					{/* Rasm */}
					<div style={{ flexShrink: 0 }}>
						<img
							src="/img/banner/usta.jpg"
							alt="Craftsman repairing furniture"
							style={{ width: '155px', height: '185px', objectFit: 'cover', borderRadius: '8px 0 0 8px', display: 'block' }} loading="lazy" decoding="async" />
					</div>

					{/* Matn */}
					<div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px 12px 12px 20px', flex: 1 }}>
						<div style={{ display: 'flex', gap: '6px', background: 'var(--cream)', borderRadius: '8px', padding: '5px 8px', width: 'fit-content' }}>
							<HandymanIcon style={{ fontSize: '15px', color: '#c9a55a' }} />
							<HomeRepairServiceIcon style={{ fontSize: '15px', color: '#c9a55a' }} />
						</div>
						<div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-1)', lineHeight: 1.3 }}>
							{t('Repair Services')}
						</div>
						<div style={{ fontSize: '10px', color: 'var(--text-2)', lineHeight: 1.5 }}>
							{t(
								"We don't just build — we repair. Our skilled craftsmen bring new life to broken furniture. Explore our service page to view repaired items and find expert technicians ready to help.",
							)}
						</div>
						<button
							onClick={handleNavigate}
							style={{
								background: 'var(--primary)', color: '#fff', border: 'none',
								borderRadius: '8px', padding: '6px 12px', fontSize: '10px',
								fontWeight: 600, cursor: 'pointer', width: 'fit-content', alignSelf: 'flex-start'
							}}
						>
							{t('Explore Repair Service')}
						</button>
					</div>
				</div>
			</Box>
		);
	} else {
		return (
			<Box component="section" sx={{ background: 'var(--bg-warm)', py: 6 }}>
				<Box component={'div'} className="container">
					<Stack direction={{ xs: 'column', md: 'row' }} spacing={4} className="contentWrapper">
						<Box component={'div'} className="imageContainer">
							<img src="/img/banner/usta.jpg" alt="Craftsman repairing furniture" className="image" loading="lazy" decoding="async" />
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
