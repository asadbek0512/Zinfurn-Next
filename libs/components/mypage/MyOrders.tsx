import React, { ChangeEvent, useRef, useState } from 'react';
import {
	Button,
	Chip,
	Typography,
	Divider,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
	Rating,
	Stack,
	Pagination,
	Box,
	IconButton,
} from '@mui/material';
import { useReactiveVar, useQuery, useMutation } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { Order } from '../../types/order/order';
import { OrderStatus } from '../../enums/order.enum';
import { formatterStr } from '../../utils';
import { REACT_APP_API_URL } from '../../config';
import { GET_MY_ORDERS } from '../../../apollo/user/query';
import { CONFIRM_DELIVERY, REQUEST_RETURN, CREATE_REVIEW } from '../../../apollo/user/mutation';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import HourglassEmptyOutlinedIcon from '@mui/icons-material/HourglassEmptyOutlined';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import ReplayIcon from '@mui/icons-material/Replay';
import RateReviewIcon from '@mui/icons-material/RateReview';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import CancelIcon from '@mui/icons-material/Cancel';
import { sweetErrorHandling, sweetTopSmallSuccessAlert } from '../../sweetAlert';

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

const RATING_LABEL_COLOR: Record<number, string> = { 1: '#ef4444', 2: '#f97316', 3: '#f59e0b', 4: '#84cc16', 5: '#22c55e' };
const RATING_LABEL_BG: Record<number, string> = { 1: '#fee2e2', 2: '#ffedd5', 3: '#fef3c7', 4: '#f0fdf4', 5: '#dcfce7' };
const RATING_LABEL_TEXT: Record<number, string> = { 1: 'Terrible', 2: 'Poor', 3: 'Average', 4: 'Good', 5: 'Excellent' };

const MyOrders = () => {
	const { t } = useTranslation('common');
	const user = useReactiveVar(userVar);
	const device = useDeviceDetect();
	const isMobile = device === 'mobile';
	const fileInputRef = useRef<HTMLInputElement>(null);

	const [activeTab, setActiveTab] = useState<OrderStatus | null>(null);
	const [orderInquiry, setOrderInquiry] = useState({
		page: 1,
		limit: 3,
		search: {},
	});

	// Review Modal
	const [reviewOpen, setReviewOpen] = useState(false);
	const [reviewOrder, setReviewOrder] = useState<Order | null>(null);
	const [reviewItemIdx, setReviewItemIdx] = useState(0);
	const [reviewedKeys, setReviewedKeys] = useState<Set<string>>(new Set());
	const [reviewRating, setReviewRating] = useState<number>(5);
	const [reviewContent, setReviewContent] = useState('');
	const [reviewImages, setReviewImages] = useState<string[]>([]);
	const [uploading, setUploading] = useState(false);

	// derived
	const reviewTarget = reviewOrder
		? {
				orderId: reviewOrder._id,
				propertyId: reviewOrder.orderItems[reviewItemIdx]?.propertyId,
				propertyTitle: reviewOrder.orderItems[reviewItemIdx]?.propertyTitle,
				propertyImage: reviewOrder.orderItems[reviewItemIdx]?.propertyImage,
		  }
		: null;

	const openReviewModal = (order: Order) => {
		const firstIdx = order.orderItems.findIndex(
			(item) => !reviewedKeys.has(`${order._id}_${item.propertyId}`),
		);
		const idx = firstIdx >= 0 ? firstIdx : 0;
		setReviewOrder(order);
		setReviewItemIdx(idx);
		setReviewRating(5);
		setReviewContent('');
		setReviewImages([]);
		setReviewOpen(true);
	};

	// Return modal
	const [returnOpen, setReturnOpen] = useState(false);
	const [returnTarget, setReturnTarget] = useState<Order | null>(null);
	const [returnReason, setReturnReason] = useState('');

	const { data, loading, refetch } = useQuery(GET_MY_ORDERS, {
		variables: {
			input: {
				...orderInquiry,
				search: activeTab ? { orderStatus: activeTab } : {},
			},
		},
		skip: !user?._id,
		fetchPolicy: 'network-only',
		pollInterval: 15000,
	});

	const [confirmDelivery] = useMutation(CONFIRM_DELIVERY);
	const [requestReturn] = useMutation(REQUEST_RETURN);
	const [createReview] = useMutation(CREATE_REVIEW);

	const orders: Order[] = data?.getMyOrders?.list || [];
	const total = data?.getMyOrders?.metaCounter?.[0]?.total || 0;

	/** HANDLERS **/
	const handleConfirm = async (orderId: string) => {
		try {
			await confirmDelivery({ variables: { orderId } });
			refetch();
		} catch (e: any) {
			alert(e.message);
		}
	};

	const handleTabChange = (status: OrderStatus | null) => {
		setActiveTab(status);
		setOrderInquiry({ ...orderInquiry, page: 1 });
	};

	const paginationHandler = (event: ChangeEvent<unknown>, value: number) => {
		setOrderInquiry({ ...orderInquiry, page: value });
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

	const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;
		if (!files || files.length === 0) return;

		setUploading(true);
		try {
			const formData = new FormData();
			formData.append(
				'operations',
				JSON.stringify({
					query: `mutation ImagesUploader($files: [Upload!]!, $target: String!) { 
						imagesUploader(files: $files, target: $target)
				  }`,
					variables: {
						files: Array(files.length).fill(null),
						target: 'review',
					},
				}),
			);

			const map: Record<string, string[]> = {};
			for (let i = 0; i < files.length; i++) {
				map[i.toString()] = [`variables.files.${i}`];
			}
			formData.append('map', JSON.stringify(map));

			for (let i = 0; i < files.length; i++) {
				formData.append(i.toString(), files[i]);
			}

			const response = await fetch(`${process.env.REACT_APP_API_URL}/graphql`, {
				method: 'POST',
				headers: {
					'apollo-require-preflight': 'true',
					Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
				},
				body: formData,
			});

			const result = await response.json();
			if (result.data?.imagesUploader) {
				setReviewImages((prev) => [...prev, ...result.data.imagesUploader]);
			}
		} catch (err) {
			console.error('Image upload failed:', err);
		} finally {
			setUploading(false);
		}
	};

	const removeImage = (index: number) => {
		setReviewImages((prev) => prev.filter((_, i) => i !== index));
	};

	const handleReviewSubmit = async () => {
		if (!reviewTarget || !reviewContent.trim() || !reviewOrder) return;
		try {
			await createReview({
				variables: {
					input: {
						propertyId: reviewTarget.propertyId,
						orderId: reviewTarget.orderId,
						reviewRating,
						reviewContent,
						reviewImages,
					},
				},
			});

			// mark this item as reviewed
			const key = `${reviewOrder._id}_${reviewTarget.propertyId}`;
			const newReviewedKeys = new Set(Array.from(reviewedKeys).concat(key));
			setReviewedKeys(newReviewedKeys);

			// check if there are more unreviewed items in this order
			const nextIdx = reviewOrder.orderItems.findIndex(
				(item, i) => i !== reviewItemIdx && !newReviewedKeys.has(`${reviewOrder._id}_${item.propertyId}`),
			);

			if (nextIdx >= 0 && reviewOrder.orderItems.length > 1) {
				setReviewItemIdx(nextIdx);
				setReviewRating(5);
				setReviewContent('');
				setReviewImages([]);
				sweetTopSmallSuccessAlert(t('Review submitted! You can review the next item.'), 2000);
			} else {
				setReviewOpen(false);
				setReviewContent('');
				setReviewRating(5);
				setReviewImages([]);
				sweetTopSmallSuccessAlert(t('Review submitted successfully!'), 2000);
				refetch();
			}
		} catch (err) {
			await sweetErrorHandling(err);
		}
	};

	if (loading) {
		return (
			<div className="my-orders-loading">
				<HourglassEmptyOutlinedIcon /> {t('Loading...')}
			</div>
		);
	}

	return (
		<div className="my-orders-wrap">
			{!isMobile && (
				<div className="my-orders-header">
					<Typography className="my-orders-title">{t('My Orders')}</Typography>
					<span className="my-orders-count">
						{total} {t('orders')}
					</span>
				</div>
			)}

			{/* Tabs */}
			<div className="my-orders-tabs">
				{TABS.map((tab) => (
					<button
						key={tab.label}
						className={`my-orders-tab ${activeTab === tab.value ? 'active' : ''}`}
						onClick={() => handleTabChange(tab.value as OrderStatus | null)}
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
						<Button variant="contained" className="my-orders-shop-btn">
							{t('Browse Products')}
						</Button>
					</Link>
				</div>
			) : (
				<div className="my-orders-list">
					{orders.map((order) => {
						const step = PROGRESS_STEP[order.orderStatus] ?? 0;
						const progress = Math.round((step / 4) * 100);
						const orderDateStr = new Date(order.createdAt).toLocaleDateString('en-US', {
							year: 'numeric',
							month: 'short',
							day: 'numeric',
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
								{[
									OrderStatus.PENDING,
									OrderStatus.PROCESSING,
									OrderStatus.SHIPPED,
									OrderStatus.DELIVERED,
									OrderStatus.CONFIRMED,
								].includes(order.orderStatus) && (
									<div className="my-orders-progress-wrap">
										<div className="my-orders-progress-bar">
											<div className="my-orders-progress-fill" style={{ width: `${progress}%` }} />
										</div>
										<div className="my-orders-progress-labels">
											{['Ordered', 'Processing', 'Shipped', 'Delivered', 'Confirmed'].map((lbl, i) => (
												<span key={lbl} className={`my-orders-prog-lbl ${i <= step ? 'active' : ''}`}>
													{t(lbl)}
												</span>
											))}
										</div>
									</div>
								)}

								{order.orderStatus === OrderStatus.RETURN_REQUESTED && (
									<div className="my-orders-return-info">
										<ReplayIcon sx={{ fontSize: 14 }} />
										<span>
											{t('Return reason')}: {order.returnReason}
										</span>
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
												onClick={() => openReviewModal(order)}
											>
												{t('Write Review')}
												{order.orderItems.length > 1 && (
													<span style={{ marginLeft: 4, background: '#f5a623', color: '#fff', borderRadius: 10, fontSize: 10, padding: '1px 6px', fontWeight: 700 }}>
														{order.orderItems.length - Array.from(reviewedKeys).filter(k => k.startsWith(order._id)).length}
													</span>
												)}
											</Button>
										)}

										{/* Return request */}
										{order.orderStatus === OrderStatus.CONFIRMED && (
											<Button
												variant="text"
												size="small"
												className="my-orders-return-btn"
												startIcon={<ReplayIcon sx={{ fontSize: 14 }} />}
												onClick={() => {
													setReturnTarget(order);
													setReturnOpen(true);
												}}
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

			{orders.length > 0 && (
				<Stack className="pagination-config" sx={{ mt: 4, mb: 2 }}>
					<Stack className="pagination-box" sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
						<Pagination
							count={Math.ceil(total / orderInquiry.limit)}
							page={orderInquiry.page}
							shape="circular"
							color="primary"
							onChange={paginationHandler}
						/>
					</Stack>
					{!isMobile && (
						<Stack className="total-result" sx={{ textAlign: 'center', mt: 1 }}>
							<Typography variant="caption" sx={{ color: '#666' }}>
								{t('Total {{total}} orders found', { total })}
							</Typography>
						</Stack>
					)}
				</Stack>
			)}

			{/* Review Modal */}
			<Dialog
				open={reviewOpen}
				onClose={() => setReviewOpen(false)}
				maxWidth="sm"
				fullWidth
				PaperProps={{ sx: { borderRadius: '16px', p: 1 } }}
			>
				<DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700 }}>
					<RateReviewIcon sx={{ color: '#d89801' }} />
					{t('Rate & Review Product')}
					{reviewOrder && reviewOrder.orderItems.length > 1 && (
						<span style={{ marginLeft: 'auto', fontSize: 12, color: '#999', fontWeight: 400 }}>
							{reviewItemIdx + 1} / {reviewOrder.orderItems.length}
						</span>
					)}
				</DialogTitle>
				<DialogContent>
					{/* Multi-item selector */}
					{reviewOrder && reviewOrder.orderItems.length > 1 && (
						<div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 16, paddingBottom: 4 }}>
							{reviewOrder.orderItems.map((item, i) => {
								const key = `${reviewOrder._id}_${item.propertyId}`;
								const isDone = reviewedKeys.has(key);
								const isActive = i === reviewItemIdx;
								return (
									<div
										key={i}
										onClick={() => { if (!isDone) { setReviewItemIdx(i); setReviewRating(5); setReviewContent(''); setReviewImages([]); } }}
										style={{
											position: 'relative', flexShrink: 0, width: 64, height: 64, borderRadius: 10,
											border: isActive ? '2px solid #f5a623' : isDone ? '2px solid #22c55e' : '2px solid #eee',
											overflow: 'hidden', cursor: isDone ? 'default' : 'pointer',
											opacity: isDone ? 0.6 : 1,
										}}
										title={item.propertyTitle}
									>
										<img
											src={item.propertyImage ? `${REACT_APP_API_URL}/${item.propertyImage}` : '/img/banner/header1.svg'}
											style={{ width: '100%', height: '100%', objectFit: 'cover' }}
										/>
										{isDone && (
											<div style={{ position: 'absolute', inset: 0, background: 'rgba(34,197,94,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 20, fontWeight: 700 }}>
												✓
											</div>
										)}
									</div>
								);
							})}
						</div>
					)}

					<Typography variant="body2" sx={{ mb: 3, color: '#666' }}>
						{t('Share your experience with')} <strong>{reviewTarget?.propertyTitle}</strong>
					</Typography>

						<div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
						<div>
							<Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
								{t('Overall Rating')}
							</Typography>
							<div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
								<Rating
									value={reviewRating}
									onChange={(_, val) => setReviewRating(val || 5)}
									size="large"
									sx={{ color: '#ffc107' }}
								/>
								<span style={{ padding: '4px 12px', borderRadius: 8, fontSize: 13, fontWeight: 700, color: RATING_LABEL_COLOR[reviewRating] || '#888', background: RATING_LABEL_BG[reviewRating] || '#f5f5f5' }}>
									{t(RATING_LABEL_TEXT[reviewRating] || '')}
								</span>
							</div>
						</div>

						<div>
							<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
								<Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
									{t('Your Feedback')}
								</Typography>
								<Typography variant="caption" sx={{ color: reviewContent.length > 900 ? '#ef4444' : '#aaa' }}>
									{reviewContent.length} / 1000
								</Typography>
							</div>
							<textarea
								rows={5}
								style={{
									width: '100%',
									padding: '12px 15px',
									borderRadius: '12px',
									border: '1px solid #ddd',
									backgroundColor: '#f9f9f9',
									fontFamily: 'inherit',
									fontSize: '14px',
									outline: 'none',
									resize: 'none',
									boxSizing: 'border-box'
								}}
								maxLength={1000}
								placeholder={t('What did you like or dislike? How is the quality?')}
								value={reviewContent}
								onChange={(e) => setReviewContent(e.target.value)}
							/>
						</div>

						<div>
							<Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
								{t('Photos (Optional)')}
							</Typography>
							<div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
								{reviewImages.map((img, idx) => (
									<div key={idx} style={{ position: 'relative', width: 80, height: 80 }}>
										<img
											src={`${REACT_APP_API_URL}/${img}`}
											style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
										/>
										<IconButton
											size="small"
											sx={{
												position: 'absolute',
												top: -8,
												right: -8,
												bgcolor: 'white',
												'&:hover': { bgcolor: '#eee' },
											}}
											onClick={() => removeImage(idx)}
										>
											<CancelIcon sx={{ fontSize: 18, color: '#ff4d4f' }} />
										</IconButton>
									</div>
								))}
								{reviewImages.length < 5 && (
									<div
										onClick={() => fileInputRef.current?.click()}
										style={{ width: 80, height: 80, border: '2px dashed #ddd', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
									>
										<AddPhotoAlternateIcon sx={{ color: '#999' }} />
									</div>
								)}
							</div>
							<input
								type="file"
								hidden
								multiple
								ref={fileInputRef}
								onChange={handleImageUpload}
								accept="image/*"
							/>
							{uploading && (
								<Typography variant="caption" color="primary">
									{t('Uploading...')}
								</Typography>
							)}
						</div>
					</div>
				</DialogContent>
				<DialogActions sx={{ p: 3, pt: 0 }}>
					<Button
						onClick={() => setReviewOpen(false)}
						sx={{ color: '#666', textTransform: 'none', fontWeight: 600 }}
					>
						{t('Cancel')}
					</Button>
					<Button
						variant="contained"
						onClick={handleReviewSubmit}
						disabled={!reviewContent.trim() || uploading}
						sx={{
							bgcolor: '#181a20',
							'&:hover': { bgcolor: '#2c3038' },
							textTransform: 'none',
							borderRadius: '10px',
							px: 4,
							py: 1,
							fontWeight: 600,
							boxShadow: 'none',
						}}
					>
						{reviewOrder && reviewOrder.orderItems.length > 1
							? t('Submit & Next')
							: t('Submit Review')}
					</Button>
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
						onChange={(e) => setReturnReason(e.target.value)}
						placeholder={t('e.g. Product damaged, wrong item received...')}
					/>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setReturnOpen(false)}>{t('Cancel')}</Button>
					<Button
						variant="contained"
						color="error"
						onClick={handleReturnSubmit}
						disabled={!returnReason.trim()}
					>
						{t('Submit Request')}
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
};

export default MyOrders;
