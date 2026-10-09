import { PropertyColor } from "./enums/property.enum";

export const REACT_APP_API_URL = `${process.env.REACT_APP_API_URL}`;

export const availableOptions = ['propertyBarter', 'propertyRent'];

const thisYear = new Date().getFullYear();

export const propertyYears: any = [];

for (let i = 1970; i <= thisYear; i++) {
	propertyYears.push(String(i));
}
export const propertyColorList: PropertyColor[] = Object.values(PropertyColor) as PropertyColor[];
export const Messages = {
	error1: 'Something went wrong!',
	error2: 'Please login first!',
	error3: 'Please fulfill all inputs!',
	error4: 'Message is empty!',
	error5: 'Only images with jpeg, jpg, png format allowed!',
};

export const topPropertyRank = 2;



/** Yetkazib berish — backend bilan bir xil bo'lsin (order.service.ts) */
export const FREE_DELIVERY_THRESHOLD = 500;
export const DELIVERY_FEE = 15;
export const calcDeliveryFee = (merchandise: number): number =>
	merchandise >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
