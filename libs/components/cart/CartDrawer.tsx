import React, { useEffect, useState } from 'react';
import {
	Drawer,
	Stack,
	Typography,
	IconButton,
	Button,
	Box,
	Divider,
	Chip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import { useReactiveVar } from '@apollo/client';
import { cartVar, cartDrawerVar, userVar } from '../../../apollo/store';
import { removeFromCart, updateCartQty, getCartTotal } from '../../utils/cartUtils';
import { loadUserOrders } from '../../utils/orderUtils';
import { Order } from '../../types/order/order';
import { formatterStr } from '../../utils';
import { REACT_APP_API_URL } from '../../config';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';

const CartDrawer = () => {
	const { t } = useTranslation('common');
	const open = useReactiveVar(cartDrawerVar);
	const items = useReactiveVar(cartVar);
	const user = useReactiveVar(userVar);
	const total = getCartTotal(items);
	const [activeOrders, setActiveOrders] = useState<Order[]>([]);

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

	// Load recent orders when drawer opens
	useEffect(() => {
		if (open && user?._id) {
			const orders = loadUserOrders(user._id);
			setActiveOrders(orders.slice(0, 2));
		}
	}, [open, user?._id]);

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
													<Typography className="cart-item-sale-price">${formatterStr(item.property.propertySalePrice)}</Typography>
													<Typography className="cart-item-orig-price">${formatterStr(item.property.propertyPrice)}</Typography>
												</div>
											) : (
												<Typography className="cart-item-price">${formatterStr(item.property.propertyPrice)}</Typography>
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
												{t('Subtotal')}: ${formatterStr(price * item.quantity)}
											</Typography>
										</div>
									</div>
								);
							})}
						</div>
					)}
				</div>

				{/* Active orders section */}
				{activeOrders.length > 0 && (
					<div className="cart-orders-section">
						<Divider />
						<Link href="/mypage?category=myOrders" onClick={handleClose} className="cart-orders-header-link">
							<div className="cart-orders-header">
								<LocalShippingOutlinedIcon className="cart-orders-icon" />
								<Typography className="cart-orders-heading">{t('You have active orders')}</Typography>
							</div>
							<div className="order-progress-animation">
								<div className="progress-line"></div>
								<LocalShippingOutlinedIcon className="animating-car" />
							</div>
						</Link>
					</div>
				)}

				{/* Footer */}
				{items.length > 0 && (
					<div className="cart-drawer-footer">
						<Divider />
						<div className="cart-footer-total">
							<Typography className="cart-total-label">{t('Total')}</Typography>
							<Typography className="cart-total-val">${formatterStr(total)}</Typography>
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
