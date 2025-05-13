import { Direction } from "../../enums/common_enum";
import { PropertyType } from "../../enums/property.enum";
import { RepairPropertyStatus, RepairPropertyType } from "../../enums/repairProperty.enum";

export interface RepairPropertyInput {
    repairUserId: string;
    repairPropertyType: PropertyType;
    repairPropertyStatus?: RepairPropertyStatus;
    repairPropertyAddress: string;
    repairPropertyDescription: string;
    repairPropertyImages?: string[];
    constructedAt?: Date;
    memberId?: string;
}

export interface RepairPISearch {
    memberId?: string;
    typeList?: RepairPropertyType[];
    repairPropertyStatus?: RepairPropertyStatus;
    text?: string;
}

export interface RepairPropertiesInquiry {
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
    repairPropertyStatus?: RepairPropertyStatus;
}

export interface TechnicianPropertiesInquiry {
    page: number;
    limit: number;
    sort?: string;
    direction?: Direction;
    search: RAPISearch;
}

export interface AllRepairPropertiesInquiry {
    page: number;
    limit: number;
    sort?: string;
    direction?: Direction;
    search: RAPISearch;
}
