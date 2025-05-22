import {  PropertyCategory, PropertyColor, PropertyCondition, PropertyMaterial, PropertyStatus, PropertyType } from '../../enums/property.enum';
import { Member } from '../member/member';

export interface MeLiked {
	memberId: string;
	likeRefId: string;
	myFavorite: boolean;
}

export interface TotalCounter {
	total: number;
}

export interface Property {
	views: number;
	likes: number;
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
	propertyDesc?: string;
	propertyBarter?: boolean;
	propertyRent?: boolean;
	propertyInStock?: boolean;
	propertyCondition: PropertyCondition;
	propertyBrand?: string;
	propertyOriginCountry?: string;
	propertyAddress?: string;
	propertyViews: number;
	propertyLikes?: number;
	propertyComments?: number;
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
