import { Direction } from '../../enums/common_enum';
import { PropertyCategory, PropertyColor, PropertyCondition, PropertyMaterial, PropertyStatus, PropertyType } from '../../enums/property.enum';

export interface PropertyInput {
	propertyType: PropertyType;
	propertyStatus?: PropertyStatus;
	propertyCategory: PropertyCategory;     //// PropertyLocation
	propertyMaterial: PropertyMaterial;		// bedsList?
	propertyColor: PropertyColor;			// squaresRange?
	propertySize?: string;
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
	propertyCondition: PropertyCondition;	//roomsList
	propertyBrand?: string;
	propertyOriginCountry?: string;
	soldAt?: Date;
	memberId?: string;
	constructedAt?: Date;
}


export interface PISearch {
	memberId?: string;   					/// memberId?: string;
	categoryList?: PropertyCategory[];		// locationList?: PropertyLocation[];
	typeList?: PropertyType[];				// typeList?: PropertyType[];
	conditionList?: PropertyCondition[];	// roomsList?: Number[];
	materialList?: PropertyMaterial[]; 				// bedsList?: Number[];
	colorList?: PropertyColor[];					// squaresRange?: Range 
	pricesRange?: Range;
	options?: string[];
	text?: string;
}


export interface PropertiesInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: PISearch;
}

interface APISearch {
	propertyStatus?: PropertyStatus;
}

export interface AgentPropertiesInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: APISearch;
}

interface ALPISearch {
	propertyStatus?: PropertyStatus;
	propertyCategory?: PropertyCategory[];

}

export interface AllPropertiesInquiry {
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
