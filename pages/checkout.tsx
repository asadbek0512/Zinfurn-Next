import React, { useRef, useState } from 'react';
import { NextPage } from 'next';
import { Button, Divider, Step, StepLabel, Stepper, TextField, Typography } from '@mui/material';
import { useReactiveVar, useMutation } from '@apollo/client';
import { cartVar, userVar } from '../apollo/store';
import { clearCart, getCartTotal } from '../libs/utils/cartUtils';
import { formatterStr } from '../libs/utils';
import { REACT_APP_API_URL } from '../libs/config';
import { CREATE_ORDER } from '../apollo/user/mutation';
import { Order } from '../libs/types/order/order';
import Link from 'next/link';
import useDeviceDetect from '../libs/hooks/useDeviceDetect';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import CreditCardOutlinedIcon from '@mui/icons-material/CreditCardOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const STEPS = ['Delivery', 'Payment', 'Done'];

const formatCardNumber = (val: string) =>
	val.replace(/\D/g, '').substring(0, 16).replace(/(.{4})/g, '$1 ').trim();

const formatExpiry = (val: string) => {
	const d = val.replace(/\D/g, '').substring(0, 4);
	return d.length >= 3 ? d.slice(0, 2) + '/' + d.slice(2) : d;
};

const Checkout: NextPage = () => {
	const { t } = useTranslation('common');
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const items = useReactiveVar(cartVar);
	const total = getCartTotal(items);
	const isMobile = device === 'mobile';

	const [step, setStep] = useState(0);
	const [summaryOpen, setSummaryOpen] = useState(false);
	const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
	const [placeError, setPlaceError] = useState('');

	const [fullName, setFullName] = useState(user?.memberFullName || user?.memberNick || '');
	const [address, setAddress] = useState(user?.memberAddress || '');
	const [city, setCity] = useState('');
	const [phone, setPhone] = useState(user?.memberPhone || '');
	const [note, setNote] = useState('');

	const [cardNumber, setCardNumber] = useState('');
	const [cardHolder, setCardHolder] = useState('');
	const [expiry, setExpiry] = useState('');
	const [cvv, setCvv] = useState('');
	const [cardErrors, setCardErrors] = useState<Record<string, string>>({});

	const savedTotal = useRef(total);

	const [createOrder, { loading: placing }] = useMutation(CREATE_ORDER);

	const step1Valid = fullName.trim() && address.trim() && phone.trim();

	const validateStep2 = () => {
		const e: Record<string, string> = {};
		if (cardNumber.replace(/\s/g, '').length < 16) e.cardNumber = 'Enter valid 16-digit card number';
		if (!cardHolder.trim()) e.cardHolder = 'Enter cardholder name';
		const [m, y] = expiry.split('/');
		if (!m || !y || +m > 12 || +m < 1 || y.length < 2) e.expiry = 'Enter valid expiry MM/YY';
		if (cvv.length < 3) e.cvv = 'Enter CVV';
		setCardErrors(e);
		return Object.keys(e).length === 0;
	};

	const handleNext = async () => {
		if (step === 0 && !step1Valid) return;
		if (step === 1) {
			if (!validateStep2()) return;
			savedTotal.current = total;
			setPlaceError('');
			try {
				const orderItems = items.map(item => ({
					propertyId: item.property._id,
					propertyTitle: item.property.propertyTitle,
					propertyImage: item.property.propertyImages?.[0] || null,
					propertyPrice: item.property.propertySalePrice ?? item.property.propertyPrice,
					quantity: item.quantity,
				}));
				const { data } = await createOrder({
					variables: {
						input: {
							orderItems,
							orderTotal: total,
							deliveryInfo: { fullName, address, city, phone, note: note || undefined },
						},
					},
				});
				setPlacedOrder(data.createOrder);
				clearCart();
			} catch (err: any) {
				setPlaceError(err?.message || 'Failed to place order. Please try again.');
				return;
			}
		}
		setStep(s => s + 1);
	};

	/* ── Guards ── */
	if (!user?._id) {
		return (
			<div className="co-guard">
				<LockOutlinedIcon className="co-guard-icon" />
				<Typography className="co-guard-title">{t('Login Required')}</Typography>
				<Typography className="co-guard-sub">{t('Please log in to complete your purchase')}</Typography>
				<Link href="/account/join"><Button variant="contained" className="co-guard-btn">{t('Login')} / {t('Register')}</Button></Link>
			</div>
		);
	}
	if (items.length === 0 && step < 2) {
		return (
			<div className="co-guard">
				<InfoOutlinedIcon className="co-guard-icon co-guard-icon--info" />
				<Typography className="co-guard-title">{t('Your cart is empty')}</Typography>
				<Link href="/property"><Button variant="contained" className="co-guard-btn">{t('Browse Products')}</Button></Link>
			</div>
		);
	}

	/* ── Summary block ── */
	const Summary = () => (
		<div className="co-summary">
			<p className="co-summary-label">{t('Order Summary')}</p>
			{items.map(item => {
				const price = item.property.propertySalePrice ?? item.property.propertyPrice;
				const img = item.property.propertyImages?.[0]
					? `${REACT_APP_API_URL}/${item.property.propertyImages[0]}`
					: '/img/banner/header1.svg';
				return (
					<div className="co-sum-item" key={item.property._id}>
						<div className="co-sum-img-wrap">
							<img src={img} alt={item.property.propertyTitle} />
							<span className="co-sum-qty">{item.quantity}</span>
						</div>
						<span className="co-sum-name">{item.property.propertyTitle}</span>
						<span className="co-sum-price">${formatterStr(price * item.quantity)}</span>
					</div>
				);
			})}
			<Divider sx={{ my: 1.5 }} />
			<div className="co-sum-row"><span>{t('Subtotal')}</span><span>${formatterStr(total)}</span></div>
			<div className="co-sum-row"><span>{t('Shipping')}</span><span className="co-free">{t('Free')}</span></div>
			<Divider sx={{ my: 1 }} />
			<div className="co-sum-row co-sum-total"><span>{t('Total')}</span><span>${formatterStr(total)}</span></div>
		</div>
	);

	/* ── Step 1: Delivery ── */
	const Step1 = () => (
		<div className="co-step">
			<div className="co-step-header">
				<LocationOnOutlinedIcon />
				<span>{t('Delivery Information')}</span>
			</div>
			<TextField label={t('Full Name')} value={fullName} onChange={e => setFullName(e.target.value)}
				fullWidth required variant="outlined" className="co-field" size={isMobile ? 'small' : 'medium'}
				InputLabelProps={{ shrink: !!fullName }} />
			<TextField label={t('Delivery Address')} value={address} onChange={e => setAddress(e.target.value)}
				fullWidth required multiline rows={2} className="co-field" size={isMobile ? 'small' : 'medium'}
				InputLabelProps={{ shrink: !!address }}
				sx={{ '& .MuiInputBase-inputMultiline': { paddingTop: '8px' } }} />
			<TextField label={t('City')} value={city} onChange={e => setCity(e.target.value)}
				fullWidth className="co-field" size={isMobile ? 'small' : 'medium'}
				InputLabelProps={{ shrink: !!city }} />
			<TextField label={t('Phone Number')} value={phone} onChange={e => setPhone(e.target.value)}
				fullWidth required className="co-field" placeholder="+998 __ ___ __ __" size={isMobile ? 'small' : 'medium'}
				InputLabelProps={{ shrink: !!phone }} />
			<TextField label={t('Order Note (optional)')} value={note} onChange={e => setNote(e.target.value)}
				fullWidth multiline rows={2} className="co-field" size={isMobile ? 'small' : 'medium'}
				InputLabelProps={{ shrink: !!note }}
				sx={{ '& .MuiInputBase-inputMultiline': { paddingTop: '8px' } }} />
		</div>
	);

	/* ── Step 2: Payment ── */
	const Step2 = () => (
		<div className="co-step">
			<div className="co-step-header">
				<CreditCardOutlinedIcon />
				<span>{t('Payment Details')}</span>
			</div>

			<div className="co-test-hint">
				<span className="co-test-hint-label">Test card:</span>
				<button className="co-test-hint-btn" onClick={() => {
					setCardNumber('4242 4242 4242 4242');
					setCardHolder('TEST USER');
					setExpiry('12/26');
					setCvv('123');
				}}>
					4242 4242 4242 4242 &nbsp;·&nbsp; 12/26 &nbsp;·&nbsp; 123
				</button>
			</div>

			<div className="co-card-preview">
				<div className="co-card-chip" />
				<p className="co-card-num">{cardNumber || '•••• •••• •••• ••••'}</p>
				<div className="co-card-footer">
					<div>
						<p className="co-card-lbl">CARD HOLDER</p>
						<p className="co-card-val">{cardHolder || 'YOUR NAME'}</p>
					</div>
					<div>
						<p className="co-card-lbl">EXPIRES</p>
						<p className="co-card-val">{expiry || 'MM/YY'}</p>
					</div>
				</div>
			</div>

			<TextField label={t('Card Number')} value={cardNumber}
				onChange={e => setCardNumber(formatCardNumber(e.target.value))}
				fullWidth required className="co-field" placeholder="1234 5678 9012 3456"
				error={!!cardErrors.cardNumber} helperText={cardErrors.cardNumber}
				inputProps={{ maxLength: 19 }} size={isMobile ? 'small' : 'medium'} />

			<TextField label={t('Cardholder Name')} value={cardHolder}
				onChange={e => setCardHolder(e.target.value.toUpperCase())}
				fullWidth required className="co-field"
				error={!!cardErrors.cardHolder} helperText={cardErrors.cardHolder}
				size={isMobile ? 'small' : 'medium'} />

			<div className="co-card-row">
				<TextField label={t('Expiry')} value={expiry}
					onChange={e => setExpiry(formatExpiry(e.target.value))}
					required placeholder="MM/YY"
					error={!!cardErrors.expiry} helperText={cardErrors.expiry}
					size={isMobile ? 'small' : 'medium'} className="co-field" />
				<TextField label="CVV" value={cvv}
					onChange={e => setCvv(e.target.value.replace(/\D/g, '').substring(0, 4))}
					required placeholder="•••" inputProps={{ maxLength: 4 }}
					error={!!cardErrors.cvv} helperText={cardErrors.cvv}
					size={isMobile ? 'small' : 'medium'} className="co-field" />
			</div>

			{placeError && <p className="co-error">{placeError}</p>}

			<div className="co-secure">
				<LockOutlinedIcon sx={{ fontSize: 14 }} />
				<span>{t('Your payment information is secure and encrypted')}</span>
			</div>
		</div>
	);

	/* ── Step 3: Confirmation ── */
	const Step3 = () => (
		<div className="co-confirm">
			<div className="co-confirm-circle">
				<CheckCircleIcon className="co-confirm-check" />
			</div>
			<p className="co-confirm-title">{t('Order Placed!')}</p>
			<span className="co-confirm-id">#{placedOrder?.orderId}</span>

			<div className="co-confirm-details">
				{[
					[t('Delivery to'), `${address}${city ? `, ${city}` : ''}`],
					[t('Contact'), phone],
					[t('Estimated delivery'), `3–5 ${t('business days')}`],
					[t('Total paid'), `$${formatterStr(savedTotal.current)}`],
				].map(([label, val]) => (
					<div className="co-confirm-row" key={label}>
						<span className="co-confirm-lbl">{label}</span>
						<span className={`co-confirm-val${label === t('Total paid') ? ' co-confirm-total' : ''}`}>{val}</span>
					</div>
				))}
			</div>

			<Link href={placedOrder ? `/order/tracking?id=${placedOrder._id}` : '/mypage'} style={{ width: '100%', textDecoration: 'none' }}>
				<Button variant="contained" fullWidth className="co-btn-primary">{t('Track Your Order')}</Button>
			</Link>
			<Link href="/mypage?category=myOrders" style={{ width: '100%', textDecoration: 'none' }}>
				<Button variant="outlined" fullWidth className="co-btn-outline">{t('My Orders')}</Button>
			</Link>
			<Link href="/" style={{ width: '100%', textDecoration: 'none' }}>
				<Button variant="text" fullWidth className="co-btn-text">{t('Back to Home')}</Button>
			</Link>
		</div>
	);

	/* ── Mobile layout ── */
	if (isMobile) {
		return (
			<div className="co-mob">
				<div className="co-mob-header">
					<Link href="/" className="co-mob-back">
						<ArrowBackIosNewIcon sx={{ fontSize: 18 }} />
					</Link>
					<span className="co-mob-title">{t('Checkout')}</span>
					<div style={{ width: 36 }} />
				</div>

				{step < 2 && (
					<div className="co-mob-stepper">
						<Stepper activeStep={step} alternativeLabel>
							{STEPS.map(l => <Step key={l}><StepLabel>{t(l)}</StepLabel></Step>)}
						</Stepper>
					</div>
				)}

				{step < 2 && (
					<button className="co-mob-sum-toggle" onClick={() => setSummaryOpen(o => !o)}>
						<span>{t('Order Summary')} · <b>${formatterStr(total)}</b></span>
						{summaryOpen ? <KeyboardArrowUpIcon sx={{ fontSize: 18 }} /> : <KeyboardArrowDownIcon sx={{ fontSize: 18 }} />}
					</button>
				)}
				{step < 2 && summaryOpen && (
					<div className="co-mob-sum-panel"><Summary /></div>
				)}

				<div className="co-mob-body" style={step === 2 ? { paddingTop: '70px' } : undefined}>
					{step === 0 && <Step1 />}
					{step === 1 && <Step2 />}
					{step === 2 && <Step3 />}
				</div>

				{step < 2 && (
					<div className="co-mob-footer">
						{step > 0 && (
							<button className="co-mob-back-btn" onClick={() => setStep(s => s - 1)}>
								{t('Back')}
							</button>
						)}
						<Button
							variant="contained"
							fullWidth={step === 0}
							onClick={handleNext}
							className="co-mob-next-btn"
							disabled={(step === 0 ? !step1Valid : false) || placing}
						>
							{placing ? t('Placing...') : step === 1 ? t('Place Order') : t('Continue')}
						</Button>
					</div>
				)}
			</div>
		);
	}

	/* ── PC layout ── */
	return (
		<div className="co-pc">
			<div className="co-pc-wrap">
				<div className="co-pc-header">
					<Link href="/" className="co-back-link">
						<ArrowBackIosNewIcon sx={{ fontSize: 16 }} />
						{t('Back')}
					</Link>
					<span className="co-pc-title">{t('Checkout')}</span>
				</div>

				{step < 2 && (
					<div className="co-pc-stepper">
						<Stepper activeStep={step} alternativeLabel>
							{STEPS.map(l => <Step key={l}><StepLabel>{t(l)}</StepLabel></Step>)}
						</Stepper>
					</div>
				)}

				<div className={`co-pc-layout ${step === 2 ? 'co-pc-layout--confirm' : ''}`}>
					<div className="co-pc-left">
						{step === 0 && <Step1 />}
						{step === 1 && <Step2 />}
						{step === 2 && <Step3 />}

						{step < 2 && (
							<div className="co-pc-actions">
								{step > 0 && (
									<Button variant="outlined" onClick={() => setStep(s => s - 1)} className="co-btn-back">
										{t('Back')}
									</Button>
								)}
								<Button variant="contained" onClick={handleNext}
									className="co-btn-primary" disabled={(step === 0 ? !step1Valid : false) || placing}>
									{placing ? t('Placing...') : step === 1 ? t('Place Order') : t('Continue')}
								</Button>
							</div>
						)}
					</div>

					{step < 2 && (
						<div className="co-pc-right"><Summary /></div>
					)}
				</div>
			</div>
		</div>
	);
};

export default Checkout;
