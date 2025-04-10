import type { DataCenter } from "@envops-cms/model";
import type { Comparison } from "@envops-cms/utils";

export function createAWSDataCenterNode(
    dc: DataCenter<"AWS"> | Comparison<DataCenter<"AWS">>
  ) {}