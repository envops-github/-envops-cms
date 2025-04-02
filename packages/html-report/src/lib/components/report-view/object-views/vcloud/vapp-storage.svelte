<script lang="ts">
    import type { DataCenter, VCloud } from "@envops-cms/model";
    import { valueFromComparison, type Comparison } from "@envops-cms/utils";
    import type { TreeNode } from "../../../reusable/tree/tree.svelte";
    import SummaryCard from "../summary-card.svelte";
    import { statusIcon } from "../../report-view.svelte";
  
    let {
      isComparison,
      vappStorageNode,
    }: {
      isComparison: boolean;
      vappStorageNode: TreeNode<
        (VCloud.vApp | Comparison<VCloud.vApp>) & {}
      >;
    } = $props();
  
    const vappComparison = vappStorageNode.data as Comparison<VCloud.vApp>;
    const vapp = vappStorageNode.data as VCloud.vApp;
  
  </script>

<div class="p-4 space-y-4 @container flex flex-col">
  <div class="flex flex-col gap-2 min-w-fit">
  
  </div>
</div>