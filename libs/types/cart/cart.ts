export interface CartProduct {
	_id: string;
	productTitle: string;
	productPrice: number;
	productSalePrice?: number;
	productImages?: string[];
	productType: string;
	memberNick?: string;
}

export interface CartItem {
	product: CartProduct;
	quantity: number;
}
