import React, { useState } from 'react';
import { Button, Chip, Typography, Divider, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Rating } from '@mui/material';
import { useReactiveVar, useQuery, useMutation } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { Order } from '../../types/order/order';
import { OrderStatus } from '../../enums/order.enum';
import { formatterStr } from '../../utils';
import { REACT_APP_API_URL } from '../../config';
import { GET_MY_ORDERS } from '../../../apollo/user/query';
import { CONFIRM_DELIVERY, REQUEST_RETURN, CREATE_REVIEW, DEMO_DELIVER_ORDER } from '../../../apollo/user/mutation';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import HourglassEmptyOutlinedIcon from '@mui/icons-material/HourglassEmptyOutlined';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import ReplayIcon from '@mui/icons-material/Replay';

const STATUS_COLOR: Record<string, 'warning' | 'info' | 'primary' | 'success' | 'error' | 'default'> = {
	[OrderStatus.PENDING]: 'warning',
	[OrderStatus.PROCESSING]: 'warning',
	[OrderStatus.SHIPPED]: 'info',
	[OrderStatus.DELIVERED]: 'primary',
	[OrderStatus.CONFIRMED]: 'success',
	[OrderStatus.CANCELLED]: 'error',
	[OrderStatus.RETURN_REQUESTED]: 'error',
	[OrderStatus.RETURNED]: 'default',
};

const STATUS_LABEL: Record<string, string> = {
	[OrderStatus.PENDING]: 'Pending',
	[OrderStatus.PROCESSING]: 'Processing',
	[OrderStatus.SHIPPED]: 'Shipped',
	[OrderStatus.DELIVERED]: 'Delivered',
	[OrderStatus.CONFIRMED]: 'Confirmed',
	[OrderStatus.CANCELLED]: 'Cancelled',
	[OrderStatus.RETURN_REQUESTED]: 'Return Requested',
	[OrderStatus.RETURNED]: 'Returned',
};

const PROGRESS_STEP: Record<string, number> = {
	[OrderStatus.PENDING]: 0,
	[OrderStatus.PROCESSING]: 1,
	[OrderStatus.SHIPPED]: 2,
	[OrderStatus.DELIVERED]: 3,
	[OrderStatus.CONFIRMED]: 4,
};

const TABS = [
	{ label: 'All', value: null },
	{ label: 'Processing', value: OrderStatus.PROCESSING },
	{ label: 'Shipped', value: OrderStatus.SHIPPED },
	{ label: 'Delivered', value: OrderStatus.DELIVERED },
	{ label: 'Confirmed', value: OrderStatus.CONFIRMED },
	{ label: 'Returns', value: OrderStatus.RETURN_REQUESTED },
];

const MyOrders = () => {
	const { t } = useTranslation('common');
	const user = useReactiveVar(userVar);
	const device = useDeviceDetect();
	const isMobile = device === 'mobile';

	const [activeTab, setActiveTab] = useState<OrderStatus | null>(null);

	// Review modal
	const [reviewOpen, setReviewOpen] = useState(false);
	const [reviewTarget, setReviewTarget] = useState<{ orderId: string; propertyId: string; propertyTitle: string } | null>(null);
	const [reviewRating, setReviewRating] = useState<number>(5);
	const [reviewContent, setReviewContent] = useState('');

	// Return modal
	const [returnOpen, setReturnOpen] = useState(false);
	const [returnTarget, setReturnTarget] = useState<Order | null>(null);
	const [returnReason, setReturnReason] = useState('');

	const { data, loading, refetch } = useQuery(GET_MY_ORDERS, {
		variables: { input: { page: 1, limit: 50, search: activeTab ? { orderStatus: activeTab } : {} } },
		skip: !user?._id,
		fetchPolicy: 'network-only',
		pollInterval: 15000,
	});

	const [confirmDelivery] = useMutation(CONFIRM_DELIVERY);
	const [demoDeliver] = useMutation(DEMO_DELIVER_ORDER);
	const [requestReturn] = useMutation(REQUEST_RETURN);
	const [createReview] = useMutation(CREATE_REVIEW);

	const orders: Order[] = data?.getMyOrders?.list || [];

	const handleConfirm = async (orderId: string) => {
		try {
			await confirmDelivery({ variables: { orderId } });
			refetch();
		} catch (e: any) {
			alert(e.message);
		}
	};

	const handleDemoDeliver = async (orderId: string) => {
		try {
			await demoDeliver({ variables: { orderId } });
			refetch();
		} catch (e: any) {
			alert(e.message);
		}
	};

	const handleReturnSubmit = async () => {
		if (!returnTarget || !returnReason.trim()) return;
		try {
			await requestReturn({ variables: { input: { _id: returnTarget._id, returnReason } } });
			setReturnOpen(false);
			setReturnReason('');
			refetch();
		} catch (e: any) {
			alert(e.message);
		}
	};

	const handleReviewSubmit = async () => {
		if (!reviewTarget || reviewRating < 1 || !reviewContent.trim()) return;
		try {
			await createReview({
				variables: {
					input: {
						propertyId: reviewTarget.propertyId,
						orderId: reviewTarget.orderId,
						reviewRating,
						reviewContent,
					},
				},
			});
			setReviewOpen(false);
			setReviewContent('');
			setReviewRating(5);
		} catch (e: any) {
			alert(e.message);
		}
	};

	if (loading) {
		return <div className="my-orders-loading"><HourglassEmptyOutlinedIcon /> {t('Loading...')}</div>;
	}

	return (
		<div className="my-orders-wrap">
			{!isMobile && (
				<div className="my-orders-header">
					<Typography className="my-orders-title">{t('My Orders')}</Typography>
					<span className="my-orders-count">{orders.length} {t('orders')}</span>
				</div>
			)}

			{/* Tabs */}
			<div className="my-orders-tabs">
				{TABS.map(tab => (
					<button
						key={tab.label}
						className={`my-orders-tab ${activeTab === tab.value ? 'active' : ''}`}
						onClick={() => setActiveTab(tab.value)}
					>
						{t(tab.label)}
					</button>
				))}
			</div>

			{orders.length === 0 ? (
				<div className="my-orders-empty">
					<ShoppingBagOutlinedIcon className="my-orders-empty-icon" />
					<Typography className="my-orders-empty-title">{t('No orders yet')}</Typography>
					<Typography className="my-orders-empty-sub">{t('Your order history will appear here')}</Typography>
					<Link href="/property">
						<Button variant="contained" className="my-orders-shop-btn">{t('Browse Products')}</Button>
					</Link>
				</div>
			) : (
				<div className="my-orders-list">
					{orders.map((order) => {
						const step = PROGRESS_STEP[order.orderStatus] ?? 0;
						const progress = Math.round((step / 4) * 100);
						const orderDateStr = new Date(order.createdAt).toLocaleDateString('en-US', {
							year: 'numeric', month: 'short', day: 'numeric',
						});

						return (
							<div className="my-orders-card" key={order._id}>
								{/* Card header */}
								<div className="my-orders-card-header">
									<div className="my-orders-card-id-wrap">
										<Typography className="my-orders-card-id">#{order.orderId}</Typography>
										<Typography className="my-orders-card-date">{orderDateStr}</Typography>
									</div>
									<Chip
										label={t(STATUS_LABEL[order.orderStatus] || order.orderStatus)}
										color={STATUS_COLOR[order.orderStatus] || 'default'}
										size="small"
										className="my-orders-status-chip"
									/>
								</div>

								{/* Items preview */}
								<div className="my-orders-items-preview">
									{order.orderItems.slice(0, 3).map((item, idx) => {
										const imgSrc = item.propertyImage
											? `${REACT_APP_API_URL}/${item.propertyImage}`
											: '/img/banner/header1.svg';
										return (
											<div className="my-orders-item-thumb" key={idx} title={item.propertyTitle}>
												<img src={imgSrc} alt={item.propertyTitle} />
												{item.quantity > 1 && <span className="my-orders-item-qty">×{item.quantity}</span>}
											</div>
										);
									})}
									{order.orderItems.length > 3 && (
										<div className="my-orders-item-more">+{order.orderItems.length - 3}</div>
									)}
									<div className="my-orders-item-name">
										{order.orderItems[0]?.propertyTitle}
										{order.orderItems.length > 1 && ` +${order.orderItems.length - 1} more`}
									</div>
								</div>

								{/* Progress bar (only for active statuses) */}
								{[OrderStatus.PENDING, OrderStatus.PROCESSING, OrderStatus.SHIPPED, OrderStatus.DELIVERED, OrderStatus.CONFIRMED].includes(order.orderStatus) && (
									<div className="my-orders-progress-wrap">
										<div className="my-orders-progress-bar">
											<div className="my-orders-progress-fill" style={{ width: `${progress}%` }} />
										</div>
										<div className="my-orders-progress-labels">
											{['Ordered', 'Processing', 'Shipped', 'Delivered', 'Confirmed'].map((lbl, i) => (
												<span key={lbl} className={`my-orders-prog-lbl ${i <= step ? 'active' : ''}`}>{t(lbl)}</span>
											))}
										</div>
									</div>
								)}

								{order.orderStatus === OrderStatus.RETURN_REQUESTED && (
									<div className="my-orders-return-info">
										<ReplayIcon sx={{ fontSize: 14 }} />
										<span>{t('Return reason')}: {order.returnReason}</span>
									</div>
								)}

								<Divider sx={{ my: 1 }} />

								{/* Footer */}
								<div className="my-orders-card-footer">
									<Typography className="my-orders-total">
										{t('Total')}: <strong>${formatterStr(order.orderTotal)}</strong>
									</Typography>
									<div className="my-orders-actions">
										{/* Track button */}
										{[OrderStatus.SHIPPED, OrderStatus.DELIVERED].includes(order.orderStatus) && (
											<Link href={`/order/tracking?id=${order._id}`} style={{ textDecoration: 'none' }}>
												<Button variant="contained" size="small" className="my-orders-track-btn">
													<LocalShippingOutlinedIcon sx={{ fontSize: 14, mr: 0.5 }} />
													{t('Track')}
												</Button>
											</Link>
										)}

										{/* Demo: force deliver — portfolio only */}
										{[OrderStatus.PENDING, OrderStatus.PROCESSING, OrderStatus.SHIPPED].includes(order.orderStatus) && (
											<Button
												variant="outlined"
												size="small"
												className="my-orders-demo-btn"
												onClick={() => handleDemoDeliver(order._id)}
											>
												📦 {t('Simulate Arrival')}
											</Button>
										)}

										{/* Confirm delivery */}
										{order.orderStatus === OrderStatus.DELIVERED && (
											<Button
												variant="outlined"
												size="small"
												className="my-orders-confirm-btn"
												onClick={() => handleConfirm(order._id)}
												startIcon={<CheckCircleOutlinedIcon sx={{ fontSize: 14 }} />}
											>
												{t('Confirm Receipt')}
											</Button>
										)}

										{/* Write review (after confirmed) */}
										{order.orderStatus === OrderStatus.CONFIRMED && (
											<Button
												variant="outlined"
												size="small"
												className="my-orders-review-btn"
												startIcon={<StarOutlineIcon sx={{ fontSize: 14 }} />}
												onClick={() => {
													setReviewTarget({
														orderId: order._id,
														propertyId: order.orderItems[0]?.propertyId,
														propertyTitle: order.orderItems[0]?.propertyTitle,
													});
													setReviewOpen(true);
												}}
											>
												{t('Write Review')}
											</Button>
										)}

										{/* Return request */}
										{order.orderStatus === OrderStatus.CONFIRMED && (
											<Button
												variant="text"
												size="small"
												className="my-orders-return-btn"
												startIcon={<ReplayIcon sx={{ fontSize: 14 }} />}
												onClick={() => { setReturnTarget(order); setReturnOpen(true); }}
											>
												{t('Return')}
											</Button>
										)}
									</div>
								</div>
							</div>
						);
					})}
				</div>
			)}

			{/* Review Modal */}
			<Dialog open={reviewOpen} onClose={() => setReviewOpen(false)} maxWidth="sm" fullWidth>
				<DialogTitle>{t('Write a Review')}</DialogTitle>
				<DialogContent>
					{reviewTarget && (
						<Typography variant="body2" sx={{ mb: 2, color: '#666' }}>{reviewTarget.propertyTitle}</Typography>
					)}
					<div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
						<Typography variant="body2">{t('Rating')}:</Typography>
						<Rating
							value={reviewRating}
							onChange={(_, val) => setReviewRating(val || 1)}
							size="large"
						/>
					</div>
					<TextField
						label={t('Your Review')}
						multiline
						rows={4}
						fullWidth
						value={reviewContent}
						onChange={e => setReviewContent(e.target.value)}
						placeholder={t('Share your experience with this product...')}
					/>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setReviewOpen(false)}>{t('Cancel')}</Button>
					<Button variant="contained" onClick={handleReviewSubmit} disabled={!reviewContent.trim()}>{t('Submit')}</Button>
				</DialogActions>
			</Dialog>

			{/* Return Modal */}
			<Dialog open={returnOpen} onClose={() => setReturnOpen(false)} maxWidth="sm" fullWidth>
				<DialogTitle>{t('Request Return')}</DialogTitle>
				<DialogContent>
					<Typography variant="body2" sx={{ mb: 2, color: '#666' }}>
						{t('Please describe the reason for your return request')}
					</Typography>
					<TextField
						label={t('Return Reason')}
						multiline
						rows={3}
						fullWidth
						value={returnReason}
						onChange={e => setReturnReason(e.target.value)}
						placeholder={t('e.g. Product damaged, wrong item received...')}
					/>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setReturnOpen(false)}>{t('Cancel')}</Button>
					<Button variant="contained" color="error" onClick={handleReturnSubmit} disabled={!returnReason.trim()}>{t('Submit Request')}</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
};

export default MyOrders;
