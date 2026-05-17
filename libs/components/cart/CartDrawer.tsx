import React, { useEffect } from 'react';
import {
	Drawer,
	Typography,
	IconButton,
	Button,
	Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import { useReactiveVar, useQuery } from '@apollo/client';
import { cartVar, cartDrawerVar, userVar } from '../../../apollo/store';
import { removeFromCart, updateCartQty, getCartTotal } from '../../utils/cartUtils';
import { OrderStatus } from '../../enums/order.enum';
import { formatterStr } from '../../utils';
import { REACT_APP_API_URL } from '../../config';
import { GET_MY_ORDERS } from '../../../apollo/user/query';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { useCurrency } from '../../context/CurrencyContext';

const ACTIVE_STATUSES = [OrderStatus.PENDING, OrderStatus.PROCESSING, OrderStatus.SHIPPED, OrderStatus.DELIVERED];

const CartDrawer = () => {
	const { t } = useTranslation('common');
	const { formatPrice } = useCurrency();
	const open = useReactiveVar(cartDrawerVar);
	const items = useReactiveVar(cartVar);
	const user = useReactiveVar(userVar);
	const total = getCartTotal(items);

	const { data: ordersData } = useQuery(GET_MY_ORDERS, {
		variables: { input: { page: 1, limit: 10, search: {} } },
		skip: !user?._id || !open,
		fetchPolicy: 'network-only',
		pollInterval: open ? 15000 : 0,
	});

	const activeOrders = (ordersData?.getMyOrders?.list || []).filter((o: any) =>
		ACTIVE_STATUSES.includes(o.orderStatus)
	);
	const hasActiveOrder = activeOrders.length > 0;

	// Load persisted cart from localStorage (client-side only)
	useEffect(() => {
		try {
			const raw = localStorage.getItem('zinfurn_cart');
			if (raw) {
				const parsed = JSON.parse(raw);
				if (Array.isArray(parsed) && parsed.length > 0) {
					cartVar(parsed);
				}
			}
		} catch {}
	}, []);

	const handleClose = () => cartDrawerVar(false);

	return (
		<Drawer
			anchor="right"
			open={open}
			onClose={handleClose}
			PaperProps={{ className: 'cart-drawer-paper' }}
			sx={{ zIndex: 100000 }}
		>
			<div className="cart-drawer">
				{/* Header */}
				<div className="cart-drawer-header">
					<div className="cart-drawer-title">
						<ShoppingCartOutlinedIcon className="cart-drawer-icon" />
						<Typography className="cart-drawer-heading">{t('Shopping Cart')}</Typography>
						<span className="cart-drawer-count">{items.length}</span>
					</div>
					<IconButton onClick={handleClose} className="cart-drawer-close">
						<CloseIcon />
					</IconButton>
				</div>

				<Divider />

				{/* Body */}
				<div className="cart-drawer-body">
					{items.length === 0 ? (
						<div className="cart-drawer-empty">
							<ShoppingCartOutlinedIcon className="cart-empty-icon" />
							<Typography className="cart-empty-text">{t('Your cart is empty')}</Typography>
							<Typography className="cart-empty-sub">{t('Add some items to get started')}</Typography>
							<Button
								variant="outlined"
								className="cart-empty-btn"
								onClick={handleClose}
							>
								{t('Continue Shopping')}
							</Button>
						</div>
					) : (
						<div className="cart-drawer-items">
							{items.map((item) => {
								const imgSrc = item.property.propertyImages?.[0]
									? `${REACT_APP_API_URL}/${item.property.propertyImages[0]}`
									: '/img/banner/header1.svg';
								const price = item.property.propertySalePrice ?? item.property.propertyPrice;
								return (
									<div className="cart-drawer-item" key={item.property._id}>
										<div className="cart-item-img-wrap">
											<img src={imgSrc} alt={item.property.propertyTitle} className="cart-item-img" />
										</div>
										<div className="cart-item-info">
											<Typography className="cart-item-title">{item.property.propertyTitle}</Typography>
											{item.property.propertySalePrice ? (
												<div className="cart-item-price-row">
													<Typography className="cart-item-sale-price">{formatPrice(item.property.propertySalePrice)}</Typography>
													<Typography className="cart-item-orig-price">{formatPrice(item.property.propertyPrice)}</Typography>
												</div>
											) : (
												<Typography className="cart-item-price">{formatPrice(item.property.propertyPrice)}</Typography>
											)}
											<div className="cart-item-controls">
												<div className="cart-qty-box">
													<IconButton
														size="small"
														onClick={() => updateCartQty(item.property._id, item.quantity - 1)}
														className="cart-qty-btn"
													>
														<RemoveIcon fontSize="small" />
													</IconButton>
													<span className="cart-qty-val">{item.quantity}</span>
													<IconButton
														size="small"
														onClick={() => updateCartQty(item.property._id, item.quantity + 1)}
														className="cart-qty-btn"
													>
														<AddIcon fontSize="small" />
													</IconButton>
												</div>
												<IconButton
													size="small"
													onClick={() => removeFromCart(item.property._id)}
													className="cart-delete-btn"
												>
													<DeleteOutlineIcon fontSize="small" />
												</IconButton>
											</div>
											<Typography className="cart-item-subtotal">
												{t('Subtotal')}: {formatPrice(price * item.quantity)}
											</Typography>
										</div>
									</div>
								);
							})}
						</div>
					)}
				</div>

				{/* Active order banner — above total, always visible when order exists */}
				{hasActiveOrder && (
					<Link href="/mypage?category=myOrders" onClick={handleClose} className="cart-orders-header-link">
						<div className="cart-orders-section">
							<div className="cart-orders-header">
								<LocalShippingOutlinedIcon className="cart-orders-icon" />
								<Typography className="cart-orders-heading">{t('You have an active order')}</Typography>
							</div>
							<div className="order-progress-animation">
								<div className="progress-line" />
								<LocalShippingOutlinedIcon className="animating-car" />
							</div>
						</div>
					</Link>
				)}

				{/* Footer */}
				{items.length > 0 && (
					<div className="cart-drawer-footer">
						<Divider />
						<div className="cart-footer-total">
							<Typography className="cart-total-label">{t('Total')}</Typography>
							<Typography className="cart-total-val">{formatPrice(total)}</Typography>
						</div>
						<Typography className="cart-footer-note">
							{t('Shipping & taxes calculated at checkout')}
						</Typography>
						<Link href="/checkout" onClick={handleClose} className="cart-checkout-link">
							<Button variant="contained" fullWidth className="cart-checkout-btn">
								{t('Proceed to Checkout')}
							</Button>
						</Link>
						<Button
							variant="text"
							fullWidth
							className="cart-continue-btn"
							onClick={handleClose}
						>
							{t('Continue Shopping')}
						</Button>
					</div>
				)}
			</div>
		</Drawer>
	);
};

export default CartDrawer;
