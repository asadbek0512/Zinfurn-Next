import { OrderStatus } from '../../enums/order.enum';
import { PaymentMethod, PaymentStatus } from '../../enums/payment.enum';
import { Member } from '../member/member';

export interface OrderItem {
	propertyId: string;
	propertyTitle: string;
	propertyImage?: string;
	propertyPrice: number;
	quantity: number;
}

export interface DeliveryInfo {
	fullName: string;
	address: string;
	city: string;
	phone: string;
	note?: string;
}

export interface Order {
	_id: string;
	orderId: string;
	memberId: string;
	orderItems: OrderItem[];
	orderStatus: OrderStatus;
	orderTotal: number;
	orderDiscount?: number;
	deliveryFee?: number;
	deliveryInfo: DeliveryInfo;
	paymentMethod?: PaymentMethod;
	paymentStatus?: PaymentStatus;
	paymentAmount?: number;
	paymentCurrency?: string;
	paidAt?: Date;
	confirmedAt?: Date;
	cancelledAt?: Date;
	returnRequestedAt?: Date;
	returnReason?: string;
	returnedAt?: Date;
	createdAt: Date;
	updatedAt: Date;
	memberData?: Member;
}

export interface Orders {
	list: Order[];
	metaCounter: { total: number }[];
}

export interface CreateOrderInput {
	orderItems: Omit<OrderItem, '_id'>[];
	orderTotal: number;
	deliveryInfo: DeliveryInfo;
}

export interface OrdersInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: string;
	search?: { orderStatus?: OrderStatus };
}
