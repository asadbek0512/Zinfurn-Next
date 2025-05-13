import { RepairPropertyStatus, RepairPropertyType } from "../../enums/repairProperty.enum";

export interface RepairPropertyUpdate {
    _id: string;
    repairPropertyType?: RepairPropertyType;
    repairPropertyStatus?: RepairPropertyStatus;
    deletedAt?: Date;
    constructedAt?: Date;
  }
  