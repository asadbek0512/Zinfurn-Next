import { PropertyCategory, PropertyColor, PropertyCondition, PropertyMaterial, PropertyStatus, PropertyType } from '../../enums/property.enum';

export interface PropertyUpdate {
	_id: string;
	propertyType?: PropertyType;
	propertyStatus?: PropertyStatus;
	propertyCategory?: PropertyCategory;
	propertyMaterial?: PropertyMaterial;
	propertyColor?: PropertyColor;
	propertySize?: string;
	propertyTitle?: string;
	propertyPrice?: number;
	propertySalePrice?: number;
	propertyIsOnSale?: boolean;
	propertySaleExpiresAt?: Date;
	propertyImages?: string[];
	propertyDesc?: string;
	propertyBarter?: boolean;
	propertyRent?: boolean;
	propertyInStock?: boolean;
	propertyCondition?: PropertyCondition;
	propertyBrand?: string;
	propertyOriginCountry?: string;
	constructedAt?: Date;
	soldAt?: Date;
	deletedAt?: Date;
  }
  