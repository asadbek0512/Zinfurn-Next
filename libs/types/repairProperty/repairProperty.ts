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

export interface RepairProperty {
    _id: string;
    repairUserId: string;
    repairPropertyType: RepairPropertyType;
    repairPropertyStatus?: RepairPropertyStatus;
    repairPropertyAddress: string;
    repairPropertyDescription: string;
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
