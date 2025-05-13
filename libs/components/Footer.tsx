import FacebookOutlinedIcon from '@mui/icons-material/FacebookOutlined';
import InstagramIcon from '@mui/icons-material/Instagram';
import TelegramIcon from '@mui/icons-material/Telegram';
import TwitterIcon from '@mui/icons-material/Twitter';
import useDeviceDetect from '../hooks/useDeviceDetect';
import { Stack, Box } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import PinterestIcon from '@mui/icons-material/Pinterest';

import moment from 'moment';

const Footer = () => {
	const device = useDeviceDetect();

	if (device == 'mobile') {
		return (
			<Stack className={'footer-container'}>
				<Stack className={'main'}>
					<Stack className={'left'}>
						<Box component={'div'} className={'footer-box'}>
							<img src="/img/logo/logoWhite.svg" alt="" className={'logo'} />
						</Box>
						<Box component={'div'} className={'footer-box'}>
							<span>total free customer care</span>
							<p>+82 10 4867 2909</p>
						</Box>
						<Box component={'div'} className={'footer-box'}>
							<span>nee live</span>
							<p>+82 10 4867 2909</p>
							<span>Support?</span>
						</Box>
						<Box component={'div'} className={'footer-box'}>
							<p>follow us on social media</p>
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
								<strong>Popular Search</strong>
								<span>Property for Rent</span>
								<span>Property Low to hide</span>
							</div>
							<div>
								<strong>Quick Links</strong>
								<span>Terms of Use</span>
								<span>Privacy Policy</span>
								<span>Pricing Plans</span>
								<span>Our Services</span>
								<span>Contact Support</span>
								<span>FAQs</span>
							</div>
							<div>
								<strong>Discover</strong>
								<span>Seoul</span>
								<span>Gyeongido</span>
								<span>Busan</span>
								<span>Jejudo</span>
							</div>
						</Box>
					</Stack>
				</Stack>
				<Stack className={'second'}>
					<span>© Nestar - All rights reserved. Nestar {moment().year()}</span>
				</Stack>
			</Stack>
		);
	} else {
		return (
			<Stack className={'footer-container'}>
				<Stack component={'div'} className={'top'}>
					<div className="left-content">
						<strong>Sign up for 20% discount</strong>
						<p>Unlock exclusive deals and trend alerts. Sign up now for the latest in furniture.</p>
					</div>
					<div className="subscribe-form">
						<input type="text" placeholder="Email" />
						<button>Subscribe</button>
					</div>
				</Stack>
				<Stack className={'main'}>
					<Box component={'div'} className={'bottom'}>

						<div className="footer-link">

							<img src="/img/logo/11.png" alt="" className={'logo'} />
							<div className='text'>Dear girls, stop giving yourself a hard time just because y
								fit the set bars of beauty and fashion. Its Time To be an unpoolocash you with Costume County!</div>
							<div className={'media-box'}>
								<FacebookOutlinedIcon />
								<TelegramIcon />
								<InstagramIcon />
								<TwitterIcon />
							</div>
						</div>

						<div className="footer-links">
							<strong>Popular categories</strong>
							<span>About us</span>
							<span>Contact</span>
							<span>Faq</span>
							<span>Privacy policy</span>
							<span>Return & exchange</span>
							<span>Shipping policy</span>
							<span>Terms & condition</span>
						</div>
						<div className="footer-links">
							<strong>Discover</strong>
							<span>Home</span>
							<span>Shop</span>
							<span>Blog</span>
							<span>Pages</span>
						</div>
						<div className="footer-links">
							<strong>Quick links</strong>
							<span>About us</span>
							<span>Contact</span>
							<span>Faq</span>
							<span>Privacy policy</span>
							<span>Return & exchange</span>
							<span>Shipping policy</span>
							<span>Terms & condition</span>
						</div>
						<div className="shop-contact">
							<strong>Shop contact</strong>
							<div className="contact-info">
								<div className="info-row">
									<span className="label">Hotline:</span>
									<span className="value">Free 24/7</span>
								</div>
								<div className="info-row">
									<span className="label">Phone:</span>
									<span className="value">+01 0123 456 789</span>
								</div>
								<div className="info-row">
									<span className="label">Address:</span>
									<span className="value">1010 white street block, USA</span>
								</div>
								<div className="info-row">
									<span className="label">Email:</span>
									<span className="value">admin@gmail.com</span>
								</div>
							</div>
						</div>


					</Box>
				</Stack>
				<Stack className={'second'}>
					<span>© {moment().year()}, LogiC/O infotech Powered by Shopify</span>
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
