import React, { useMemo, useState } from 'react';
import { NextPage } from 'next';
import { Button, Divider, Typography } from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useQuery, useMutation } from '@apollo/client';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InventoryOutlinedIcon from '@mui/icons-material/InventoryOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import DirectionsBikeOutlinedIcon from '@mui/icons-material/DirectionsBikeOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import { GET_ORDER_BY_ID } from '../../apollo/user/query';
import { CONFIRM_DELIVERY } from '../../apollo/user/mutation';
import { Order } from '../../libs/types/order/order';
import { OrderStatus } from '../../libs/enums/order.enum';
import { formatterStr } from '../../libs/utils';
import { useCurrency } from '../../libs/context/CurrencyContext';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const TRACKING_STEPS = [
	{ key: OrderStatus.PENDING,    label: 'Order Placed',     desc: 'Your order has been received',       icon: <InventoryOutlinedIcon /> },
	{ key: OrderStatus.PROCESSING, label: 'Processing',       desc: 'Warehouse is preparing your items',  icon: <StorefrontOutlinedIcon /> },
	{ key: OrderStatus.SHIPPED,    label: 'Shipped',          desc: 'Your order is on its way',           icon: <LocalShippingOutlinedIcon /> },
	{ key: OrderStatus.DELIVERED,  label: 'Delivered',        desc: 'Package delivered successfully',     icon: <DirectionsBikeOutlinedIcon /> },
	{ key: OrderStatus.CONFIRMED,  label: 'Confirmed',        desc: 'Purchase confirmed by buyer',        icon: <HomeOutlinedIcon /> },
];

const STEP_INDEX: Partial<Record<OrderStatus, number>> = {
	[OrderStatus.PENDING]: 0,
	[OrderStatus.PROCESSING]: 1,
	[OrderStatus.SHIPPED]: 2,
	[OrderStatus.DELIVERED]: 3,
	[OrderStatus.CONFIRMED]: 4,
};

const OrderTracking: NextPage = () => {
	const { t } = useTranslation('common');
	const { formatPrice } = useCurrency();
	const router = useRouter();
	useDeviceDetect();
	const orderId = (router.query.id as string) || '';
	const [confirming, setConfirming] = useState(false);

	const { data, loading, refetch } = useQuery(GET_ORDER_BY_ID, {
		variables: { orderId },
		skip: !orderId,
		fetchPolicy: 'network-only',
		pollInterval: 10000,
	});

	const [confirmDelivery] = useMutation(CONFIRM_DELIVERY);

	const order: Order | null = data?.getOrderById || null;

	const handleConfirm = async () => {
		if (!order?._id) return;
		setConfirming(true);
		try {
			await confirmDelivery({ variables: { orderId: order._id } });
			await refetch();
		} catch (e: any) {
			alert(e.message);
		} finally {
			setConfirming(false);
		}
	};

	const activeStep = order ? (STEP_INDEX[order.orderStatus] ?? 0) : 0;

	const orderDate = useMemo(() => {
		const d = order?.createdAt ? new Date(order.createdAt) : new Date();
		return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
	}, [order]);

	const estimatedDate = useMemo(() => {
		const base = order?.createdAt ? new Date(order.createdAt) : new Date();
		base.setDate(base.getDate() + 4);
		return base.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
	}, [order]);

	const statusLabel = order ? (
		order.orderStatus === OrderStatus.CONFIRMED ? t('Completed') :
		order.orderStatus === OrderStatus.SHIPPED ? t('In Transit') :
		order.orderStatus === OrderStatus.DELIVERED ? t('Delivered') :
		order.orderStatus === OrderStatus.RETURN_REQUESTED ? t('Return Requested') :
		t('Processing')
	) : t('Processing');

	if (loading) {
		return (
			<div className="tracking-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
				<HourglassEmptyIcon sx={{ fontSize: 48, color: 'var(--primary)', opacity: 0.5 }} />
			</div>
		);
	}

	return (
		<div className="tracking-page">
			<div className="tracking-container">
				{/* Header */}
				<div className="tracking-header">
					<Link href="/mypage?category=myOrders" className="tracking-back-link">
						<button className="tracking-back-btn">
							<ArrowBackIcon fontSize="small" />
							{t('My Orders')}
						</button>
					</Link>
					<Typography className="tracking-page-title">{t('Order Tracking')}</Typography>
				</div>

				{/* Order info bar */}
				<div className="tracking-order-bar">
					<div className="tracking-order-info">
						<Typography className="tracking-order-label">{t('Order ID')}</Typography>
						<Typography className="tracking-order-id">{order?.orderId || orderId}</Typography>
					</div>
					<div className="tracking-order-info">
						<Typography className="tracking-order-label">{t('Order Date')}</Typography>
						<Typography className="tracking-order-val">{orderDate}</Typography>
					</div>
					<div className="tracking-order-info">
						<Typography className="tracking-order-label">{t('Estimated Delivery')}</Typography>
						<Typography className="tracking-order-val tracking-order-est">{estimatedDate}</Typography>
					</div>
					<div className="tracking-status-chip">
						<span className="tracking-status-dot" />
						{statusLabel}
					</div>
				</div>

				<div className="tracking-layout">
					{/* Left: tracking steps */}
					<div className="tracking-left">
						<div className="tracking-steps-wrap">
							<div className="tracking-progress-line">
								<div
									className="tracking-progress-fill"
									style={{ height: `${(activeStep / (TRACKING_STEPS.length - 1)) * 100}%` }}
								/>
							</div>

							{TRACKING_STEPS.map((step, idx) => {
								const isDone = idx <= activeStep;
								const isActive = idx === activeStep;
								return (
									<div key={step.key} className={`tracking-step ${isDone ? 'done' : ''} ${isActive ? 'active' : ''}`}>
										<div className="tracking-step-icon-wrap">
											<div className={`tracking-step-icon ${isDone ? 'done' : ''} ${isActive ? 'active' : ''}`}>
												{isDone ? <CheckCircleIcon /> : step.icon}
											</div>
										</div>
										<div className="tracking-step-content">
											<Typography className="tracking-step-label">{t(step.label)}</Typography>
											<Typography className="tracking-step-desc">{t(step.desc)}</Typography>
											{isActive && <span className="tracking-step-now">{t('Current Status')}</span>}
										</div>
									</div>
								);
							})}
						</div>

						{/* Confirm receipt button */}
						{order?.orderStatus === OrderStatus.DELIVERED && (
							<div className="tracking-confirm-box">
								<CheckCircleOutlineIcon sx={{ color: 'var(--success)' }} />
								<div>
									<Typography variant="body2" fontWeight={600}>{t('Received your order?')}</Typography>
									<Typography variant="caption" color="text.secondary">{t('Confirm receipt to unlock reviews and finalize your order')}</Typography>
								</div>
								<Button
									variant="contained"
									size="small"
									color="success"
									disabled={confirming}
									onClick={handleConfirm}
								>
									{confirming ? t('Confirming...') : t('Confirm Receipt')}
								</Button>
							</div>
						)}
						{order?.orderStatus === OrderStatus.CONFIRMED && (
							<div className="tracking-confirm-box" style={{ borderColor: 'var(--success)', background: '#f1f8f1' }}>
								<CheckCircleIcon sx={{ color: 'var(--success)' }} />
								<div>
									<Typography variant="body2" fontWeight={600}>{t('Order Confirmed!')}</Typography>
									<Typography variant="caption" color="text.secondary">{t('You can now write a review in My Orders')}</Typography>
								</div>
								<Link href="/mypage?category=myOrders" style={{ textDecoration: 'none' }}>
									<Button variant="outlined" size="small" color="success">{t('My Orders')}</Button>
								</Link>
							</div>
						)}
					</div>

					{/* Right: map + delivery details */}
					<div className="tracking-right">
						{/* Fake map */}
						<div className="tracking-map-wrap">
							<div className="tracking-map-placeholder">
								<div className="tracking-map-overlay">
									<div className="tracking-map-pin">
										<LocalShippingOutlinedIcon />
									</div>
									<Typography className="tracking-map-text">{t('Live Map Tracking')}</Typography>
									<Typography className="tracking-map-sub">{t('Available in production')}</Typography>
								</div>
								<div className="tracking-map-grid" />
							</div>
						</div>

						{/* Delivery details */}
						<div className="tracking-delivery-card">
							<Typography className="tracking-delivery-title">{t('Delivery Details')}</Typography>
							<Divider className="tracking-divider" />
							{order?.deliveryInfo?.address && (
								<div className="tracking-detail-row">
									<Typography className="tracking-detail-label">{t('Address')}</Typography>
									<Typography className="tracking-detail-val" style={{ textAlign: 'right', maxWidth: '60%' }}>
										{order.deliveryInfo.address}{order.deliveryInfo.city ? `, ${order.deliveryInfo.city}` : ''}
									</Typography>
								</div>
							)}
							{order?.deliveryInfo?.phone && (
								<div className="tracking-detail-row">
									<Typography className="tracking-detail-label">{t('Contact')}</Typography>
									<Typography className="tracking-detail-val">{order.deliveryInfo.phone}</Typography>
								</div>
							)}
							{order?.orderTotal != null && (
								<div className="tracking-detail-row">
									<Typography className="tracking-detail-label">{t('Total paid')}</Typography>
									<Typography className="tracking-detail-val" style={{ color: 'var(--primary)', fontWeight: 700 }}>
										{formatPrice(order.orderTotal)}
									</Typography>
								</div>
							)}
							<div className="tracking-detail-row">
								<Typography className="tracking-detail-label">{t('Courier')}</Typography>
								<Typography className="tracking-detail-val">ZinFurn Express</Typography>
							</div>
							<div className="tracking-detail-row">
								<Typography className="tracking-detail-label">{t('Status')}</Typography>
								<Typography className="tracking-detail-val tracking-in-transit">{statusLabel}</Typography>
							</div>
						</div>

						{/* Items list */}
						{order?.orderItems && order.orderItems.length > 0 && (
							<div className="tracking-items-card">
								<Typography className="tracking-delivery-title">{t('Order Items')}</Typography>
								<Divider className="tracking-divider" />
								{order.orderItems.map((item, i) => (
									<div key={i} className="tracking-item-row">
										<Typography className="tracking-item-title">{item.propertyTitle}</Typography>
										<Typography className="tracking-item-info">×{item.quantity} · {formatPrice(item.propertyPrice)}</Typography>
									</div>
								))}
							</div>
						)}

						{/* Action buttons */}
						<div className="tracking-actions">
							<Link href="/property" className="tracking-action-link">
								<Button variant="contained" fullWidth className="tracking-shop-btn">
									{t('Continue Shopping')}
								</Button>
							</Link>
							<Link href="/mypage?category=myOrders" className="tracking-action-link">
								<Button variant="outlined" fullWidth className="tracking-mypage-btn">
									{t('My Orders')}
								</Button>
							</Link>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default OrderTracking;
