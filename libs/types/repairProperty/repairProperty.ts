import { RepairPropertyStatus, RepairPropertyType } from "../../enums/repairProperty.enum";
import { Member } from "../member/member";

export interface MeLiked {
    memberId: string;
    likeRefId: string;
    myFavorite: boolean;
}

export interface TotalCounter {
    total: number;
}

export interface RepairI18n {
    title?: string;
    desc?: string;
}

export interface RepairTranslations {
    uz?: RepairI18n;
    en?: RepairI18n;
    ru?: RepairI18n;
    kr?: RepairI18n;
    ar?: RepairI18n;
}

export interface RepairProperty {
    _id: string;
    repairPropertyType: RepairPropertyType;
    repairPropertyStatus?: RepairPropertyStatus;
    repairPropertyAddress: string;
    repairPropertyDescription: string;
    repairPropertyTranslations?: RepairTranslations;
    repairPropertyImages?: string[];
    repairPropertyViews: number;
    repairPropertyLikes: number;
    repairPropertyComments: number;
    memberId: string;
    deletedAt?: Date;
    constructedAt?: Date;
    createdAt?: Date;
    meLiked?: MeLiked[];
    memberData?: Member;
}

export interface RepairProperties {
    list: RepairProperty[];
    metaCounter?: TotalCounter[];
}
