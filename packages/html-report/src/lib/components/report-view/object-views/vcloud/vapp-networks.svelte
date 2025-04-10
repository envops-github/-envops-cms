<script lang="ts">
  import type { VCloud } from "@envops-cms/model";
  import { type Comparison } from "@envops-cms/utils";
  import type { TreeNode } from "../../../reusable/tree/tree.svelte";

  let {
    isComparison,
    vappNetworksNode,
  }: {
    isComparison: boolean;
    vappNetworksNode: TreeNode<(VCloud.vApp | Comparison<VCloud.vApp>) & {}>;
  } = $props();

  const vappComparison = vappNetworksNode.data as Comparison<VCloud.vApp>;
  const vapp = vappNetworksNode.data as VCloud.vApp;
</script>

<div class="p-4 space-y-4 @container flex flex-col">
  <div class="flex flex-col gap-2 min-w-fit">
  
  </div>
</div>
