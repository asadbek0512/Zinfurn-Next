import FacebookOutlinedIcon from '@mui/icons-material/FacebookOutlined';
import InstagramIcon from '@mui/icons-material/Instagram';
import TelegramIcon from '@mui/icons-material/Telegram';
import TwitterIcon from '@mui/icons-material/Twitter';
import useDeviceDetect from '../hooks/useDeviceDetect';
import { Stack, Box } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import PinterestIcon from '@mui/icons-material/Pinterest';

import moment from 'moment';
import { useTranslation } from 'next-i18next';

const Footer = () => {
	const device = useDeviceDetect();
	const { t } = useTranslation('common');

	if (device == 'mobile') {
		return (
			<Stack className={'footer-container'}>
				<Stack className={'main'}>
					<Stack className={'left'}>
						<Box component={'div'} className={'footer-box'}>
							<img src="/img/logo/logoWhite.svg" alt="" className={'logo'} />
						</Box>
						<Box component={'div'} className={'footer-box'}>
							<span>{t('total free customer care')}</span>
							<p>{t('+82 10 4867 2909')}</p>
						</Box>
						<Box component={'div'} className={'footer-box'}>
							<span>{t('nee live')}</span>
							<p>{t('+82 10 4867 2909')}</p>
							<span>{t('Support?')}</span>
						</Box>
						<Box component={'div'} className={'footer-box'}>
							<p>{t('follow us on social media')}</p>
							<div className={'media-box'}>
								<FacebookOutlinedIcon />
								<TelegramIcon />
								<InstagramIcon />
								<TwitterIcon />
							</div>
						</Box>
					</Stack>
					<Stack className={'right'}>
						<Box component={'div'} className={'bottom'}>
							<div>
								<strong>{t('Popular Search')}</strong>
								<span>{t('Property for Rent')}</span>
								<span>{t('Property Low to hide')}</span>
							</div>
							<div>
								<strong>{t('Quick Links')}</strong>
								<span>{t('Terms of Use')}</span>
								<span>{t('Privacy Policy')}</span>
								<span>{t('Pricing Plans')}</span>
								<span>{t('Our Services')}</span>
								<span>{t('Contact Support')}</span>
								<span>{t('FAQs')}</span>
							</div>
							<div>
								<strong>{t('Discover')}</strong>
								<span>{t('Seoul')}</span>
								<span>{t('Gyeongido')}</span>
								<span>{t('Busan')}</span>
								<span>{t('Jejudo')}</span>
							</div>
						</Box>
					</Stack>
				</Stack>
				<Stack className={'second'}>
					<span>
						{t('© Nestar - All rights reserved. Nestar')} {moment().year()}
					</span>
				</Stack>
			</Stack>
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
									"Dear girls, stop giving yourself a hard time just because you don't fit the set bars of beauty and fashion. It's Time To be unapologetically you with Costume County!",
								)}
							</div>
							<div className={'media-box'}>
								<FacebookOutlinedIcon />
								<TelegramIcon />
								<InstagramIcon />
								<TwitterIcon />
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
							<span>{t('Home')}</span>
							<span>{t('Shop')}</span>
							<span>{t('Blog')}</span>
							<span>{t('Pages')}</span>
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
									<span className="label">{t('Hotline:')}</span>
									<span className="value">{t('Free 24/7')}</span>
								</div>
								<div className="info-row">
									<span className="label">{t('Phone:')}</span>
									<span className="value">{t('+01 0123 456 789')}</span>
								</div>
								<div className="info-row">
									<span className="label">{t('Address:')}</span>
									<span className="value">{t('1010 white street block, USA')}</span>
								</div>
								<div className="info-row">
									<span className="label">{t('Email:')}</span>
									<span className="value">{t('admin@gmail.com')}</span>
								</div>
							</div>
						</div>
					</Box>
				</Stack>
				<Stack className={'second'}>
					<span>
						© {moment().year()}, {t('LogiC/O infotech Powered by Shopify')}
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
