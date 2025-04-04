import { v4 } from "uuid";
import type { TreeNode } from "../../../reusable/tree/tree.svelte";
import type { DataCenter } from "@envops-cms/model";
import type { Comparison } from "@envops-cms/utils";
import { createVCloudDataCenterNode } from "./vcloud";
import { createBareMetalDataCenterNode } from "./bare-metal";


export function createNode(node: Omit<TreeNode, "id">): TreeNode {
    return {
        id: v4(),
        ...node,
    };
}

export function createChildNodes(parentNode: TreeNode, ...nodes: Omit<TreeNode, "id">[]) {
    return nodes.map(n => {
        n.parent = parentNode;
        const node = createNode(n);
        parentNode.children = [...(parentNode.children || []), node];
        return node;
    })
}

export function createDataCenterNode(
    dc: DataCenter | Comparison<DataCenter>
) {
    let provider =
        typeof dc.providerName === "string"
            ? dc.providerName
            : dc.providerName.source || dc.providerName.target;

    switch (provider) {
        case "vCloud":
            return createVCloudDataCenterNode(
                dc as DataCenter<"vCloud"> | Comparison<DataCenter<"vCloud">>
            );
        case "BareMetal":
            return createBareMetalDataCenterNode(
                dc as DataCenter<"BareMetal"> | Comparison<DataCenter<"BareMetal">>
            );
        // case "AWS":
        //   return createAWSDataCenterNode(
        //     dc as DataCenter<"AWS"> | Comparison<DataCenter<"AWS">>
        //   );
        // case "vCenter":
        //   return createVCenterDataCenterNode(
        //     dc as DataCenter<"vCenter"> | Comparison<DataCenter<"vCenter">>
        //   );
    }

    throw new Error(`Unsupported data center provider ${dc.providerName}`);
}