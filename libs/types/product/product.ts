import {  ProductCategory, ProductColor, ProductCondition, ProductMaterial, ProductStatus, ProductType } from '../../enums/product.enum';
import { Member } from '../member/member';

export interface MeLiked {
	memberId: string;
	likeRefId: string;
	myFavorite: boolean;
}

export interface ProductI18n {
	title?: string;
	desc?: string;
}

export interface ProductTranslations {
	uz?: ProductI18n;
	en?: ProductI18n;
	ru?: ProductI18n;
	kr?: ProductI18n;
	ar?: ProductI18n;
}

export interface TotalCounter {
	total: number;
}

export interface Product {
	_id: string;
	productType: ProductType;
	productStatus?: ProductStatus;
	productCategory: ProductCategory;
	productMaterial: ProductMaterial;
	productColor: ProductColor;
	productSize: string;
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
	productTranslations?: ProductTranslations;
	productBarter?: boolean;
	productRent?: boolean;
	productInStock?: boolean;
	productCondition: ProductCondition;
	productBrand?: string;
	productOriginCountry?: string;
	productAddress?: string;
	productViews: number;
	productLikes?: number;
	productReviews?: number;
	productRating?: number;
	productSoldCount?: number;
	productRank?: number;
	memberId: string;
	soldAt?: Date;
	deletedAt?: Date;
	constructedAt?: Date;
	createdAt?: Date;
	updatedAt?: Date;
  
	/** from aggregation **/
	meLiked?: MeLiked[];
	memberData?: Member;
  }
  

export interface Products {
	list: Product[];
	metaCounter: TotalCounter[];
}
