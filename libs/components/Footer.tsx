import FacebookOutlinedIcon from '@mui/icons-material/FacebookOutlined';
import InstagramIcon from '@mui/icons-material/Instagram';
import TelegramIcon from '@mui/icons-material/Telegram';
import TwitterIcon from '@mui/icons-material/Twitter';
import useDeviceDetect from '../hooks/useDeviceDetect';
import { Stack, Box, Link } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import PinterestIcon from '@mui/icons-material/Pinterest';

import { useTranslation } from 'next-i18next';

const Footer = () => {
	const device = useDeviceDetect();
	const { t } = useTranslation('common');

	if (device == 'mobile') {
		return (
			<div className={'mobile-footer'}>
				<div className={'mobile-footer-top'}>
					<div className={'mobile-footer-subscribe'}>
						<strong>{t('Sign up for 20% discount')}</strong>
						<p>{t('Unlock exclusive deals and trend alerts. Sign up now for the latest in furniture.')}</p>
						<div className={'mobile-subscribe-form'}>
							<input type="text" placeholder={t('Email')} />
							<button>{t('Subscribe')}</button>
						</div>
					</div>
					<div className={'mobile-footer-socials'}>
						<a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">
							<FacebookOutlinedIcon />
						</a>
						<a href="https://t.me/Khusanov_Asadbek2000" target="_blank" rel="noopener noreferrer">
							<TelegramIcon />
						</a>
						<a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">
							<InstagramIcon />
						</a>
						<a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
							<TwitterIcon />
						</a>
					</div>
				</div>

				<div className={'mobile-footer-links'}>
					<span className={'mobile-footer-col-title'}>{t('Discover')}</span>
					<span className={'mobile-footer-col-title'}>{t('Help')}</span>
					<Link href="/"><span>{t('Home')}</span></Link>
					<span>{t('About us')}</span>
					<Link href="/property"><span>{t('Furnitures')}</span></Link>
					<span>{t('Faq')}</span>
					<Link href="/agent"><span>{t('Agents')}</span></Link>
					<span>{t('Privacy policy')}</span>
					<Link href="/repairService"><span>{t('Service')}</span></Link>
					<span>{t('Contact')}</span>
					<Link href="/community"><span>{t('Community')}</span></Link>
					<span>{t('Terms & condition')}</span>
				</div>

				<div className={'mobile-footer-bottom'}>
					<div className={'mobile-footer-payments'}>
						<img src="/img/icons/1.svg" alt="visa" />
						<img src="/img/icons/2.svg" alt="mastercard" />
						<img src="/img/icons/3.svg" alt="amex" />
						<img src="/img/icons/4.svg" alt="paypal" />
					</div>
					<span>© {new Date().getFullYear()} Zinfurn. {t('All rights reserved.')}</span>
				</div>
			</div>
		);
	} else {
		return (
			<Stack className={'footer-container'}>
				<Stack component={'div'} className={'top'}>
					<div className="left-content">
						<strong>{t('Sign up for 20% discount')}</strong>
						<p>{t('Unlock exclusive deals and trend alerts. Sign up now for the latest in furniture.')}</p>
					</div>
					<div className="subscribe-form">
						<input type="text" placeholder={t('Email')} />
						<button>{t('Subscribe')}</button>
					</div>
				</Stack>
				<Stack className={'main'}>
					<Box component={'div'} className={'bottom'}>
						<div className="footer-link">
							<img src="/img/logo/11.png" alt="" className={'logo'} />
							<div className="text">
								{t(
									'Zinfurn — your trusted furniture destination. Quality pieces for every room, delivered with care.',
								)}
							</div>
							<div className="media-box">
								<a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" style={{ color: '#fff' }}>
									<FacebookOutlinedIcon />
								</a>
								<a
									href="https://t.me/Khusanov_Asadbek2000"
									target="_blank"
									rel="noopener noreferrer"
									style={{ color: '#fff' }}
								>
									<TelegramIcon />
								</a>
								<a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" style={{ color: '#fff' }}>
									<InstagramIcon />
								</a>
								<a href="https://twitter.com" target="_blank" rel="noopener noreferrer" style={{ color: '#fff' }}>
									<TwitterIcon />
								</a>
							</div>
						</div>

						<div className="footer-links">
							<strong>{t('Popular categories')}</strong>
							<span>{t('About us')}</span>
							<span>{t('Contact')}</span>
							<span>{t('Faq')}</span>
							<span>{t('Privacy policy')}</span>
							<span>{t('Return & exchange')}</span>
							<span>{t('Shipping policy')}</span>
							<span>{t('Terms & condition')}</span>
						</div>
						<div className="footer-links">
							<strong>{t('Discover')}</strong>
							<Link href="/">
								<span>{t('Home')}</span>
							</Link>

							<Link href="/property">
								<span>{t('Furnitures')}</span>
							</Link>

							<Link href="/agent">
								<span>{t('Agents')}</span>
							</Link>

							<Link href="/repairService">
								<span>{t('Service')}</span>
							</Link>

							<Link href="/community">
								<span>{t('Community')}</span>
							</Link>

							<Link href="/cs">
								<span>{t('CS')}</span>
							</Link>
						</div>
						<div className="footer-links">
							<strong>{t('quickLinks')}</strong>
							<span>{t('About us')}</span>
							<span>{t('Contact')}</span>
							<span>{t('Faq')}</span>
							<span>{t('Privacy policy')}</span>
							<span>{t('Return & exchange')}</span>
							<span>{t('Shipping policy')}</span>
							<span>{t('Terms & condition')}</span>
						</div>
						<div className="shop-contact">
							<strong>{t('Shop contact')}</strong>
							<div className="contact-info">
								<div className="info-row">
									<span className="label">{t('Hotline')}:</span>
									<span className="value">{t('Free 24/7')}</span>
								</div>
								<div className="info-row">
									<span className="label">{t('Phone')}:</span>
									<span className="value">{t('+82 10 7329 5171')}</span>
								</div>
								<div className="info-row">
									<span className="label">{t('Address')}:</span>
									<span className="value">{t('Seoul, South Korea')}</span>
								</div>
								<div className="info-row">
									<span className="label">{t('Email')}:</span>
									<span className="value">khusanovasadbek777@gmail.com</span>
								</div>
							</div>
						</div>
					</Box>
				</Stack>
				<Stack className={'second'}>
					<span>
						© {new Date().getFullYear()} Zinfurn. {t('All rights reserved.')}
					</span>
					<div className="payment-icons">
						<img src="/img/icons/1.svg" alt="visa" />
						<img src="/img/icons/2.svg" alt="mastercard" />
						<img src="/img/icons/3.svg" alt="amex" />
						<img src="/img/icons/4.svg" alt="paypal" />
						<img src="/img/icons/1.svg" alt="discover" />
					</div>
				</Stack>
			</Stack>
		);
	}
};

export default Footer;
