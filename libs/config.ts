import { ProductColor } from "./enums/product.enum";

export const REACT_APP_API_URL = `${process.env.REACT_APP_API_URL}`;

export const availableOptions = ['productBarter', 'productRent'];

const thisYear = new Date().getFullYear();

export const productYears: any = [];

for (let i = 1970; i <= thisYear; i++) {
	productYears.push(String(i));
}
export const productColorList: ProductColor[] = Object.values(ProductColor) as ProductColor[];
export const Messages = {
	error1: 'Something went wrong!',
	error2: 'Please login first!',
	error3: 'Please fulfill all inputs!',
	error4: 'Message is empty!',
	error5: 'Only images with jpeg, jpg, png format allowed!',
};

export const topProductRank = 2;



/** Yetkazib berish — backend bilan bir xil bo'lsin (order.service.ts) */
export const FREE_DELIVERY_THRESHOLD = 500;
export const DELIVERY_FEE = 15;
export const calcDeliveryFee = (merchandise: number): number =>
	merchandise >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;

/**
 * Sanalar shu vaqt zonasida ko'rsatiladi. Server (UTC) va brauzer bir xil sanani chizishi uchun shart —
 * aks holda SSR sahifalarda hydration mismatch bo'ladi (masalan "30 Oct" vs "31 Oct").
 */
export const DISPLAY_TIMEZONE = 'Asia/Seoul';
export const DISPLAY_UTC_OFFSET_MIN = 9 * 60;
