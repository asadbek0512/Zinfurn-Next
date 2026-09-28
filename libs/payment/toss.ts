import { ANONYMOUS, loadTossPayments } from '@tosspayments/tosspayments-sdk';
import { Order } from '../types/order/order';

/** Toss hujjatidagi ochiq TEST client key (public, sir emas) — real pul yechilmaydi */
const TOSS_DOCS_TEST_CLIENT_KEY = 'test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq';
const TOSS_CLIENT_KEY = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || TOSS_DOCS_TEST_CLIENT_KEY;
const TOSS_CURRENCY = 'KRW';
export const TOSS_SUCCESS_PATH = '/payment/toss/success';
export const TOSS_FAIL_PATH = '/payment/toss/fail';
/** Foydalanuvchi to'lov oynasini yopganda SDK qaytaradigan kod */
export const TOSS_USER_CANCEL = 'USER_CANCEL';
/** Toss orderName uchun maksimal uzunlik */
const ORDER_NAME_MAX = 100;

const buildOrderName = (order: Order): string => {
	const [first, ...rest] = order.orderItems;
	const name = rest.length ? `${first.propertyTitle} +${rest.length}` : first.propertyTitle;
	return name.slice(0, ORDER_NAME_MAX);
};

/** Toss to'lov oynasini ochadi; muvaffaqiyatli bo'lsa brauzer successUrl'ga o'tadi */
export const requestTossPayment = async (order: Order, customer: { name?: string; email?: string }): Promise<void> => {
	if (!order.paymentAmount) throw new Error('Payment amount is missing');
	const toss = await loadTossPayments(TOSS_CLIENT_KEY);
	const origin = window.location.origin;
	await toss.payment({ customerKey: ANONYMOUS }).requestPayment({
		method: 'CARD',
		amount: { currency: TOSS_CURRENCY, value: order.paymentAmount },
		orderId: order.orderId,
		orderName: buildOrderName(order),
		customerName: customer.name,
		customerEmail: customer.email,
		successUrl: `${origin}${TOSS_SUCCESS_PATH}`,
		failUrl: `${origin}${TOSS_FAIL_PATH}`,
	});
};

/** KRW summani ko'rsatish uchun (₩1,350,000) */
export const formatKrw = (amount: number): string =>
	new Intl.NumberFormat('ko-KR', { style: 'currency', currency: TOSS_CURRENCY }).format(amount);
