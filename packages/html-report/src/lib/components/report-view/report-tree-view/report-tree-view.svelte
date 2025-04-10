<script lang="ts" module>
  import type { Comparison, MaybePromise } from "@envops-cms/utils";
  import { type TreeNode } from "../../reusable/tree/tree.svelte";

  export function filter(node: TreeNode, filterValue: string): boolean {
    return !!(
      node.label
        .toLocaleLowerCase()
        .includes(filterValue.toLocaleLowerCase()) ||
      node.data.status
        .toLocaleLowerCase()
        .includes(filterValue.toLocaleLowerCase()) ||
      node.children?.some((c) => filter(c, filterValue))
    );
  }

  export function modelToTree(
    model: EnvironmentModel | Comparison<EnvironmentModel>
  ): TreeNode[] {
    let tree = model.dataCenters.map((dc) => {
      return createDataCenterNode(dc);
    });

    return tree;
  }
</script>

<script lang="ts">
  import type { ComparisonReportData, ModelReportData } from "../../../../main";
  import TreeView from "../../reusable/tree/tree.svelte";
  import type { EnvironmentModel } from "@envops-cms/model";
  import { createDataCenterNode } from "./nodes";

  let {
    modelReport,
    comparisonReport,
    filterValue,
    tree = $bindable([]),
    onselect,
    selected = $bindable(undefined),
  }: {
    filterValue?: string;
    modelReport?: ModelReportData;
    comparisonReport?: ComparisonReportData;
    onselect?: (selected: TreeNode) => MaybePromise;
    selected?: TreeNode;
    tree: TreeNode[];
  } = $props();

  const model =
    modelReport?.version.model ||
    (comparisonReport?.comparison as
      | EnvironmentModel
      | Comparison<EnvironmentModel>);

  tree = modelToTree(model);
</script>

<TreeView bind:tree bind:selected {onselect} {filterValue} />
