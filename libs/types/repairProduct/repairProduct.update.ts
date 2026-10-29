import { RepairProductStatus, RepairProductType } from "../../enums/repairProduct.enum";

export interface RepairProductUpdate {
    _id: string;
    repairProductType?: RepairProductType;
    repairProductStatus?: RepairProductStatus;
    deletedAt?: Date;
    constructedAt?: Date;
  }
  