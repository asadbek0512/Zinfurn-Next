import CreditCardOutlinedIcon from '@mui/icons-material/CreditCardOutlined';
import { PaymentMethod } from '../../enums/payment.enum';

interface PaymentLogoProps {
	method: PaymentMethod;
}

const PAYME_DARK = '#1d2b36';
const PAYME_TEAL = '#33cccc';
const CLICK_BLUE = '#0073ff';
const TOSS_BLUE = '#0064ff';

/** Checkout'dagi to'lov usuli logotipi — tashqi rasm yuklamaslik uchun inline SVG */
const PaymentLogo = ({ method }: PaymentLogoProps) => {
	switch (method) {
		case PaymentMethod.PAYME:
			return (
				<svg className="pay-logo" viewBox="0 0 92 28" role="img" aria-label="Payme">
					<text x="0" y="21" fontFamily="Arial, sans-serif" fontSize="24" fontWeight="700" letterSpacing="-0.5">
						<tspan fill={PAYME_DARK}>pay</tspan>
						<tspan fill={PAYME_TEAL}>me</tspan>
					</text>
				</svg>
			);
		case PaymentMethod.CLICK:
			return (
				<svg className="pay-logo" viewBox="0 0 92 28" role="img" aria-label="Click">
					<circle cx="13" cy="14" r="12" fill={CLICK_BLUE} />
					<circle cx="13" cy="14" r="5" fill="#fff" />
					<text x="31" y="21" fontFamily="Arial, sans-serif" fontSize="22" fontWeight="700" fill={CLICK_BLUE}>
						click
					</text>
				</svg>
			);
		case PaymentMethod.TOSS:
			return (
				<svg className="pay-logo" viewBox="0 0 92 28" role="img" aria-label="Toss Payments">
					<text x="0" y="21" fontFamily="Arial, sans-serif" fontSize="23" fontWeight="800" fill={TOSS_BLUE}>
						toss
					</text>
				</svg>
			);
		default:
			return <CreditCardOutlinedIcon className="pay-logo pay-logo--icon" />;
	}
};

export default PaymentLogo;
