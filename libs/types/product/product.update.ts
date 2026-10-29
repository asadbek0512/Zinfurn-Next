import { ProductCategory, ProductColor, ProductCondition, ProductMaterial, ProductStatus, ProductType } from '../../enums/product.enum';

export interface ProductUpdate {
	_id: string;
	productType?: ProductType;
	productStatus?: ProductStatus;
	productCategory?: ProductCategory;
	productMaterial?: ProductMaterial;
	productColor?: ProductColor;
	productSize?: string;
	productTitle?: string;
	productPrice?: number;
	productSalePrice?: number;
	productIsOnSale?: boolean;
	productSaleStartsAt?: Date;
	productSaleExpiresAt?: Date;
	productImages?: string[];
	productArModel?: string;
	productDesc?: string;
	productBarter?: boolean;
	productRent?: boolean;
	productInStock?: boolean;
	productCondition?: ProductCondition;
	productBrand?: string;
	productOriginCountry?: string;
	constructedAt?: Date;
	soldAt?: Date;
	deletedAt?: Date;
}
