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
      (DataCenter<"vCloud"> | Comparison<DataCenter<"vCloud">>) & {}
    >;
  } = $props();

  const dcComparison = dataCenterNode.data as Comparison<DataCenter<"vCloud">>;
  const dc = dataCenterNode.data as DataCenter<"vCloud">;
</script>

<div class="p-4 space-y-4 @container flex flex-col">
  <div class="grid grid-cols-1 @xl:grid-cols-2 @4xl:grid-cols-3 max-w-6xl gap-4">
    <SummaryCard
      title="vApps"
      icon="tdesign--app"
      baseValue={dc.vApps.length}
      {isComparison}
      sourceValue={dcComparison.vApps.filter((vapp) => vapp.status !== "added")
        .length}
      targetValue={dcComparison.vApps.filter(
        (vapp) => vapp.status !== "removed"
      ).length}
      action={{
        onclick: () => {
          dataCenterNode.open = true;
          selected =
            dataCenterNode.children?.find((c) => c.label == "vApps") ||
            selected;
        },
        label: "Details",
        icon: "mingcute--align-arrow-right-line",
      }}
    />

    <SummaryCard
      title="Networks"
      icon="icon-park-outline--network-tree"
      baseValue={dc.networks.length}
      {isComparison}
      sourceValue={dcComparison.networks.filter((n) => n.status !== "added")
        .length}
      targetValue={dcComparison.networks.filter((n) => n.status !== "removed")
        .length}
      action={{
        onclick: () => {
          dataCenterNode.open = true;
          selected =
            dataCenterNode.children?.find((c) => c.label == "Networks") ||
            selected;
        },
        label: "Details",
        icon: "mingcute--align-arrow-right-line",
      }}
    />

    <!-- TODO Calc storage -->
    <SummaryCard
      title="Allocated Storage"
      icon="material-symbols--storage"
      baseValue={0}
      unit="TB"
      {isComparison}
      sourceValue={0}
      targetValue={0}
      action={{
        onclick: () => {
          dataCenterNode.open = true;
          selected =
            dataCenterNode.children?.find((c) => c.label == "Storage") ||
            selected;
        },
        label: "Details",
        icon: "mingcute--align-arrow-right-line",
      }}
    />

    <SummaryCard
      title="VMs"
      icon="codicon--vm"
      baseValue={dc.vApps.reduce((prev, curr) => prev + curr.vms.length, 0)}
      {isComparison}
      sourceValue={dcComparison.vApps.reduce(
        (prev, curr) =>
          prev + curr.vms.filter((vm) => vm.status !== "added").length,
        0
      )}
      targetValue={dcComparison.vApps.reduce(
        (prev, curr) =>
          prev + curr.vms.filter((vm) => vm.status !== "removed").length,
        0
      )}
    />

   
  </div>
</div>
