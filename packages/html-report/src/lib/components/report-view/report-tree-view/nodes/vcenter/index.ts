import type { DataCenter } from "@envops-cms/model";
import type { Comparison } from "@envops-cms/utils";

export function createVCenterDataCenterNode(
    dc: DataCenter<"vCenter"> | Comparison<DataCenter<"vCenter">>
) { }
