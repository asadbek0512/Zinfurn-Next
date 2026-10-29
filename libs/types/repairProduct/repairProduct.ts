import { RepairProductStatus, RepairProductType } from "../../enums/repairProduct.enum";
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

export interface RepairProduct {
    _id: string;
    repairProductType: RepairProductType;
    repairProductStatus?: RepairProductStatus;
    repairProductAddress: string;
    repairProductDescription: string;
    repairProductTranslations?: RepairTranslations;
    repairProductImages?: string[];
    repairProductViews: number;
    repairProductLikes: number;
    repairProductComments: number;
    memberId: string;
    deletedAt?: Date;
    constructedAt?: Date;
    createdAt?: Date;
    meLiked?: MeLiked[];
    memberData?: Member;
}

export interface RepairProducts {
    list: RepairProduct[];
    metaCounter?: TotalCounter[];
}
