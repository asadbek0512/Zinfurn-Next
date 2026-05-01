import { Order } from '../types/order/order';

const KEY = 'zinfurn_orders';

export const saveOrder = (order: Order): void => {
	if (typeof window === 'undefined') return;
	try {
		const existing = loadOrders();
		localStorage.setItem(KEY, JSON.stringify([order, ...existing]));
	} catch {}
};

export const loadOrders = (): Order[] => {
	if (typeof window === 'undefined') return [];
	try {
		const raw = localStorage.getItem(KEY);
		return raw ? JSON.parse(raw) : [];
	} catch { return []; }
};

export const loadUserOrders = (userId: string): Order[] =>
	loadOrders().filter(o => o.memberId === userId);

export const getOrderById = (id: string): Order | undefined =>
	loadOrders().find(o => o._id === id || o.orderId === id);
