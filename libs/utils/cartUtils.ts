import { cartVar } from '../../apollo/store';
import { CartItem, CartProduct } from '../types/cart/cart';
import { hapticTap } from '../native';

const STORAGE_KEY = 'zinfurn_cart';

const persist = (items: CartItem[]) => {
	if (typeof window !== 'undefined') {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
	}
};

type LegacyCartProduct = {
	_id: string;
	propertyTitle: string;
	propertyPrice: number;
	propertySalePrice?: number;
	propertyImages?: string[];
	propertyType: string;
	memberNick?: string;
};
type StoredCartItem = { product?: CartProduct; property?: LegacyCartProduct; quantity: number };

const LEGACY_UPLOAD_DIR = 'uploads/property/';
const UPLOAD_DIR = 'uploads/product/';

// Carts saved before the property -> product rename use the old field names
const migrateLegacyItem = (item: StoredCartItem): CartItem | null => {
	if (item.product) return { product: item.product, quantity: item.quantity };
	const old = item.property;
	if (!old) return null;
	return {
		quantity: item.quantity,
		product: {
			_id: old._id,
			productTitle: old.propertyTitle,
			productPrice: old.propertyPrice,
			productSalePrice: old.propertySalePrice,
			productImages: old.propertyImages?.map((img) => img.replace(LEGACY_UPLOAD_DIR, UPLOAD_DIR)),
			productType: old.propertyType,
			memberNick: old.memberNick,
		},
	};
};

export const loadPersistedCart = (): CartItem[] => {
	if (typeof window === 'undefined') return [];
	try {
		const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
		if (!Array.isArray(parsed)) return [];
		const items = (parsed as StoredCartItem[])
			.map(migrateLegacyItem)
			.filter((item): item is CartItem => item !== null);
		if (items.length !== parsed.length || parsed.some((item: StoredCartItem) => !item.product)) persist(items);
		return items;
	} catch {
		return [];
	}
};

export const addToCart = (product: CartProduct, quantity = 1) => {
	const current = cartVar();
	const existing = current.find((item) => item.product._id === product._id);
	let updated: CartItem[];
	if (existing) {
		updated = current.map((item) =>
			item.product._id === product._id
				? { ...item, quantity: item.quantity + quantity }
				: item,
		);
	} else {
		updated = [...current, { product, quantity }];
	}
	cartVar(updated);
	hapticTap();
	persist(updated);
};

export const removeFromCart = (productId: string) => {
	const updated = cartVar().filter((item) => item.product._id !== productId);
	cartVar(updated);
	persist(updated);
};

export const updateCartQty = (productId: string, quantity: number) => {
	if (quantity < 1) {
		removeFromCart(productId);
		return;
	}
	const updated = cartVar().map((item) =>
		item.product._id === productId ? { ...item, quantity } : item,
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
		const price = item.product.productSalePrice ?? item.product.productPrice;
		return sum + price * item.quantity;
	}, 0);

export const getCartCount = (items: CartItem[]) =>
	items.reduce((sum, item) => sum + item.quantity, 0);
