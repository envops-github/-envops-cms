<script lang="ts">
  import type { DataCenter } from "@envops-cms/model";
  import type { Comparison } from "@envops-cms/utils";
  import type { TreeNode } from "../../../reusable/tree/tree.svelte";
  import SummaryCard from "../summary-card.svelte";

  let {
    selected = $bindable(),
    isComparison,
    dataCenterNode,
  }: {
    isComparison: boolean;
    selected: TreeNode;
    dataCenterNode: TreeNode<
      (DataCenter<"BareMetal"> | Comparison<DataCenter<"BareMetal">>) & {}
    >;
  } = $props();

  const dcComparison = dataCenterNode.data as Comparison<
    DataCenter<"BareMetal">
  >;
  const dc = dataCenterNode.data as DataCenter<"BareMetal">;
</script>

<div class="p-4 space-y-4 @container flex flex-col">
  <div
    class="grid grid-cols-1 @xl:grid-cols-2 @4xl:grid-cols-3 max-w-6xl gap-4"
  >
    <SummaryCard
      title="Machines"
      icon="codicon--vm"
      baseValue={dc.machines.length}
      {isComparison}
      sourceValue={dcComparison.machines.filter((m) => m.status !== "added")
        .length}
      targetValue={dcComparison.machines.filter((m) => m.status !== "removed")
        .length}
      action={{
        onclick: () => {
          dataCenterNode.open = true;
          selected =
            dataCenterNode.children?.find((c) => c.label == "Machines") ||
            selected;
        },
        label: "Details",
        icon: "mingcute--align-arrow-right-line",
      }}
    />
  </div>
</div>
