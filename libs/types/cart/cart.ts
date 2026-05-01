export interface CartProperty {
	_id: string;
	propertyTitle: string;
	propertyPrice: number;
	propertySalePrice?: number;
	propertyImages?: string[];
	propertyType: string;
	memberNick?: string;
}

export interface CartItem {
	property: CartProperty;
	quantity: number;
}
