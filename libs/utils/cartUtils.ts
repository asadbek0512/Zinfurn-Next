import { cartVar } from '../../apollo/store';
import { CartItem, CartProperty } from '../types/cart/cart';

const STORAGE_KEY = 'zinfurn_cart';

const persist = (items: CartItem[]) => {
	if (typeof window !== 'undefined') {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
	}
};

export const addToCart = (property: CartProperty, quantity = 1) => {
	const current = cartVar();
	const existing = current.find((item) => item.property._id === property._id);
	let updated: CartItem[];
	if (existing) {
		updated = current.map((item) =>
			item.property._id === property._id
				? { ...item, quantity: item.quantity + quantity }
				: item,
		);
	} else {
		updated = [...current, { property, quantity }];
	}
	cartVar(updated);
	persist(updated);
};

export const removeFromCart = (propertyId: string) => {
	const updated = cartVar().filter((item) => item.property._id !== propertyId);
	cartVar(updated);
	persist(updated);
};

export const updateCartQty = (propertyId: string, quantity: number) => {
	if (quantity < 1) {
		removeFromCart(propertyId);
		return;
	}
	const updated = cartVar().map((item) =>
		item.property._id === propertyId ? { ...item, quantity } : item,
	);
	cartVar(updated);
	persist(updated);
};

export const clearCart = () => {
	cartVar([]);
	persist([]);
};

export const getCartTotal = (items: CartItem[]) =>
	items.reduce((sum, item) => {
		const price = item.property.propertySalePrice ?? item.property.propertyPrice;
		return sum + price * item.quantity;
	}, 0);

export const getCartCount = (items: CartItem[]) =>
	items.reduce((sum, item) => sum + item.quantity, 0);
