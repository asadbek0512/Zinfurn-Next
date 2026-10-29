import { Direction } from '../../enums/common.enum';
import { ProductType } from '../../enums/product.enum';
import { RepairProductStatus, RepairProductType } from '../../enums/repairProduct.enum';

export interface RepairProductInput {
	repairProductType: RepairProductType;
	repairProductStatus?: RepairProductStatus;
	repairProductAddress: string;
	repairProductDescription: string;
	repairProductImages?: string[];
	constructedAt?: Date;
	memberId?: string;
}

export interface RepairPISearch {
	memberId?: string;
	typeList?: RepairProductType[];
	repairProductStatus?: RepairProductStatus;
	text?: string;
}

export interface RepairProductsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: RepairPISearch;
}

export interface RepairOrdinaryInquiry {
	page: number;
	limit: number;
}

export interface RAPISearch {
	repairProductStatus?: RepairProductStatus;
}

export interface TechnicianProductsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: RAPISearch;
}

export interface AllRepairProductsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: RAPISearch;
}
