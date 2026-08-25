import {  PropertyCategory, PropertyColor, PropertyCondition, PropertyMaterial, PropertyStatus, PropertyType } from '../../enums/property.enum';
import { Member } from '../member/member';

export interface MeLiked {
	memberId: string;
	likeRefId: string;
	myFavorite: boolean;
}

export interface PropertyI18n {
	title?: string;
	desc?: string;
}

export interface PropertyTranslations {
	uz?: PropertyI18n;
	en?: PropertyI18n;
	ru?: PropertyI18n;
	kr?: PropertyI18n;
	ar?: PropertyI18n;
}

export interface TotalCounter {
	total: number;
}

export interface Property {
	_id: string;
	propertyType: PropertyType;
	propertyStatus?: PropertyStatus;
	propertyCategory: PropertyCategory;
	propertyMaterial: PropertyMaterial;
	propertyColor: PropertyColor;
	propertySize: string;
	propertyTitle: string;
	propertyPrice: number;
	propertySalePrice?: number;
	propertyIsOnSale?: boolean;
	propertySaleExpiresAt?: Date;
	propertyImages?: string[];
	propertyArModel?: string;
	propertyDesc?: string;
	propertyTranslations?: PropertyTranslations;
	propertyBarter?: boolean;
	propertyRent?: boolean;
	propertyInStock?: boolean;
	propertyCondition: PropertyCondition;
	propertyBrand?: string;
	propertyOriginCountry?: string;
	propertyAddress?: string;
	propertyViews: number;
	propertyLikes?: number;
	propertyReviews?: number;
	propertyRating?: number;
	propertySoldCount?: number;
	propertyRank?: number;
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
  

export interface Properties {
	list: Property[];
	metaCounter: TotalCounter[];
}
