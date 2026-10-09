import React, { useState } from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useMutation } from '@apollo/client';
import { Button, CircularProgress, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { CONFIRM_DEMO_PAYMENT } from '../../apollo/user/mutation';
import { Order } from '../../libs/types/order/order';
import { PaymentMethod } from '../../libs/enums/payment.enum';
import { clearCart } from '../../libs/utils/cartUtils';
import PaymentLogo from '../../libs/components/common/PaymentLogo';
import { LocaleContext, DEFAULT_LOCALE, getErrorMessage } from '../../libs/types/common';

export const getStaticProps = async ({ locale }: LocaleContext) => ({
	props: {
		...(await serverSideTranslations(locale ?? DEFAULT_LOCALE, ['common'])),
	},
});

const PROVIDERS: Record<string, { method: PaymentMethod; name: string }> = {
	payme: { method: PaymentMethod.PAYME, name: 'Payme' },
	click: { method: PaymentMethod.CLICK, name: 'Click' },
};
/** Haqiqiy provayder sahifasidagidek qisqa "ishlov berish" pauzasi */
const PROCESSING_DELAY_MS = 1200;
const ORDERS_URL = '/mypage?category=myOrders';

const formatSum = (amount: number): string => `${amount.toLocaleString('ru-RU')} so'm`;

/**
 * Payme/Click merchant kalitlari yo'q paytdagi test to'lov sahifasi (portfolio uchun).
 * Provayder sahifasiga taqlid qilmaydi — "Demo" ekanini ochiq ko'rsatadi.
 */
const DemoPayment: NextPage = () => {
	const { t } = useTranslation('common');
	const router = useRouter();
	const [confirmDemoPayment] = useMutation(CONFIRM_DEMO_PAYMENT);
	const [paying, setPaying] = useState(false);
	const [order, setOrder] = useState<Order | null>(null);
	const [error, setError] = useState('');

	const orderId = typeof router.query.orderId === 'string' ? router.query.orderId : '';
	const provider = PROVIDERS[String(router.query.provider)] ?? PROVIDERS.payme;
	const amount = Number(router.query.amount) || 0;

	const pay = async () => {
		setPaying(true);
		setError('');
		try {
			await new Promise((resolve) => setTimeout(resolve, PROCESSING_DELAY_MS));
			const { data } = await confirmDemoPayment({ variables: { orderId } });
			setOrder(data.confirmDemoPayment);
			clearCart();
		} catch (err: unknown) {
			setError(getErrorMessage(err) || t('Payment failed'));
		} finally {
			setPaying(false);
		}
	};

	if (!router.isReady) {
		return (
			<div className="co-guard">
				<CircularProgress />
			</div>
		);
	}

	if (order) {
		return (
			<div className="co-guard co-toss-result">
				<div className="co-confirm">
					<div className="co-confirm-circle">
						<CheckCircleIcon className="co-confirm-check" />
					</div>
					<p className="co-confirm-title">{t('Payment complete')}</p>
					<span className="co-confirm-id">#{order.orderId}</span>
					<div className="co-confirm-details">
						<div className="co-confirm-row">
							<span className="co-confirm-lbl">{t('Total paid')}</span>
							<span className="co-confirm-val co-confirm-total">{formatSum(order.paymentAmount ?? amount)}</span>
						</div>
						<div className="co-confirm-row">
							<span className="co-confirm-lbl">{t('Payment method')}</span>
							<span className="co-confirm-val">{provider.name} (DEMO)</span>
						</div>
					</div>
					<Link href={`/order/tracking?id=${order._id}`} style={{ width: '100%', textDecoration: 'none' }}>
						<Button variant="contained" fullWidth className="co-btn-primary">{t('Track Your Order')}</Button>
					</Link>
					<Link href={ORDERS_URL} style={{ width: '100%', textDecoration: 'none' }}>
						<Button variant="outlined" fullWidth className="co-btn-outline">{t('My Orders')}</Button>
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="co-guard demo-pay">
			<div className="demo-pay-card">
				<span className="demo-pay-badge">DEMO · {t('No real payment')}</span>
				<div className="demo-pay-logo">
					<PaymentLogo method={provider.method} />
				</div>
				<div className="demo-pay-row">
					<span>{t('Order')}</span>
					<b>#{orderId}</b>
				</div>
				<div className="demo-pay-row demo-pay-total">
					<span>{t('Total')}</span>
					<b>{formatSum(amount)}</b>
				</div>
				<p className="demo-pay-hint">{t('demo_payment_hint', { provider: provider.name })}</p>
				{error && <Typography className="demo-pay-error">{error}</Typography>}
				<Button variant="contained" fullWidth className="co-btn-primary" disabled={paying || !orderId} onClick={pay}
					startIcon={paying ? <CircularProgress size={18} color="inherit" /> : <LockOutlinedIcon />}>
					{paying ? t('Processing...') : t('Pay {{amount}}', { amount: formatSum(amount) })}
				</Button>
				<Link href={ORDERS_URL} style={{ width: '100%', textDecoration: 'none' }}>
					<Button variant="text" fullWidth className="demo-pay-cancel" disabled={paying}>{t('Cancel')}</Button>
				</Link>
			</div>
		</div>
	);
};

export default DemoPayment;
