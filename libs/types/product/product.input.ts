import { Direction } from '../../enums/common.enum';
import {
	ProductCategory,
	ProductColor,
	ProductCondition,
	ProductMaterial,
	ProductStatus,
	ProductType,
} from '../../enums/product.enum';

export interface ProductInput {
	productType: ProductType;
	productStatus?: ProductStatus;
	productCategory: ProductCategory; //// ProductLocation
	productMaterial: ProductMaterial; // bedsList?
	productColor: ProductColor; // squaresRange?
	productSize?: string;
	productTitle: string;
	productPrice: number;
	productSalePrice?: number;
	productIsOnSale?: boolean;
	productStock?: number;
	productSaleStartsAt?: Date;
	productSaleExpiresAt?: Date;
	productImages?: string[];
	productArModel?: string;
	productDesc?: string;
	productBarter?: boolean;
	productRent?: boolean;
	productInStock?: boolean;
	productCondition: ProductCondition; //roomsList
	productBrand?: string;
	productOriginCountry?: string;
	soldAt?: Date;
	memberId?: string;
	constructedAt?: Date;
}

export interface PISearch {
	productIsOnSale?: boolean;
	memberId?: string; /// memberId?: string;
	categoryList?: ProductCategory[]; // locationList?: ProductLocation[];
	typeList?: ProductType[]; // typeList?: ProductType[];
	conditionList?: ProductCondition[]; // roomsList?: Number[];
	materialList?: ProductMaterial[]; // bedsList?: Number[];
	colorList?: ProductColor[]; // squaresRange?: Range
	pricesRange?: Range;
	options?: string[];
	text?: string;
}

export interface ProductsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: PISearch;
}

interface APISearch {
	productStatus?: ProductStatus;
}

export interface AgentProductsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: APISearch;
}

interface ALPISearch {
	productStatus?: ProductStatus;
	productCategory?: ProductCategory[];
}

export interface AllProductsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: ALPISearch;
}

interface Range {
	start: number;
	end: number;
}

interface PeriodsRange {
	start: Date | number;
	end: Date | number;
}

export interface OrdinaryInquiry {
	page: number;
	limit: number;
}
