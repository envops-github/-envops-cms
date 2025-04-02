<script lang="ts">
  import type { VCloud } from "@envops-cms/model";
  import { type Comparison } from "@envops-cms/utils";
  import type { TreeNode } from "../../../reusable/tree/tree.svelte";
  import PropertyTable from "../property-table.svelte";
  import SummaryCard from "../summary-card.svelte";

  let {
    isComparison,
    vappNode,
    selected = $bindable(),
  }: {
    isComparison: boolean;
    selected: TreeNode;
    vappNode: TreeNode<(VCloud.vApp | Comparison<VCloud.vApp>) & {}>;
  } = $props();

  const vapp = vappNode.data as VCloud.vApp;
  const comparisonVapp = vappNode.data as Comparison<VCloud.vApp>;
</script>

<div class="p-4 space-y-4 @container flex flex-col">
  <div
    class="grid grid-cols-1 @xl:grid-cols-2 @4xl:grid-cols-3 max-w-6xl gap-4"
  >
    <SummaryCard
      title="VMs"
      icon="codicon--vm"
      baseValue={vapp.vms.length}
      {isComparison}
      sourceValue={comparisonVapp.vms.filter((vm) => vm.status !== "added")
        .length}
      targetValue={comparisonVapp.vms.filter((vm) => vm.status !== "removed")
        .length}
      action={{
        onclick: () => {
          vappNode.open = true;
          selected =
            vappNode.children?.find((c) => c.label == "VMs") || selected;
        },
        label: "Details",
        icon: "mingcute--align-arrow-right-line",
      }}
    />
  </div>
</div>
