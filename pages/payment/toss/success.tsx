import React, { useEffect, useRef, useState } from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useMutation } from '@apollo/client';
import { Button, CircularProgress, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { CONFIRM_TOSS_PAYMENT } from '../../../apollo/user/mutation';
import { Order } from '../../../libs/types/order/order';
import { clearCart } from '../../../libs/utils/cartUtils';
import { formatKrw } from '../../../libs/payment/toss';
import { LocaleContext, DEFAULT_LOCALE, getErrorMessage } from '../../../libs/types/common';

export const getStaticProps = async ({ locale }: LocaleContext) => ({
	props: {
		...(await serverSideTranslations(locale ?? DEFAULT_LOCALE, ['common'])),
	},
});

/** Toss to'lovdan keyin shu yerga qaytaradi: ?paymentKey&orderId&amount — backend tasdiqlaydi */
const TossSuccess: NextPage = () => {
	const { t } = useTranslation('common');
	const router = useRouter();
	const [confirmTossPayment] = useMutation(CONFIRM_TOSS_PAYMENT);
	const [order, setOrder] = useState<Order | null>(null);
	const [error, setError] = useState('');
	const requested = useRef(false);

	useEffect(() => {
		if (!router.isReady || requested.current) return;
		requested.current = true;
		const { paymentKey, orderId, amount } = router.query;
		if (typeof paymentKey !== 'string' || typeof orderId !== 'string' || typeof amount !== 'string') {
			setError(t('Payment failed'));
			return;
		}
		const confirm = async () => {
			try {
				const { data } = await confirmTossPayment({ variables: { input: { paymentKey, orderId, amount: Number(amount) } } });
				setOrder(data.confirmTossPayment);
				clearCart();
			} catch (err: unknown) {
				setError(getErrorMessage(err) || t('Payment failed'));
			}
		};
		confirm();
	}, [router.isReady, router.query, confirmTossPayment, t]);

	if (error) {
		return (
			<div className="co-guard">
				<ErrorOutlineIcon className="co-guard-icon" />
				<Typography className="co-guard-title">{t('Payment failed')}</Typography>
				<Typography className="co-guard-sub">{error}</Typography>
				<Link href="/checkout"><Button variant="contained" className="co-guard-btn">{t('Back to checkout')}</Button></Link>
			</div>
		);
	}

	if (!order) {
		return (
			<div className="co-guard">
				<CircularProgress />
				<Typography className="co-guard-sub">{t('Confirming payment...')}</Typography>
			</div>
		);
	}

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
						<span className="co-confirm-val co-confirm-total">{formatKrw(order.paymentAmount ?? 0)}</span>
					</div>
					<div className="co-confirm-row">
						<span className="co-confirm-lbl">{t('Payment method')}</span>
						<span className="co-confirm-val">Toss Payments (TEST)</span>
					</div>
				</div>
				<Link href={`/order/tracking?id=${order._id}`} style={{ width: '100%', textDecoration: 'none' }}>
					<Button variant="contained" fullWidth className="co-btn-primary">{t('Track Your Order')}</Button>
				</Link>
				<Link href="/mypage?category=myOrders" style={{ width: '100%', textDecoration: 'none' }}>
					<Button variant="outlined" fullWidth className="co-btn-outline">{t('My Orders')}</Button>
				</Link>
			</div>
		</div>
	);
};

export default TossSuccess;
