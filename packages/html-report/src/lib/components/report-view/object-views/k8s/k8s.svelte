<script lang="ts">
  import type { DataCenter } from "@envops-cms/model";
  import type { Comparison } from "@envops-cms/utils";
  import type { TreeNode } from "../../../reusable/tree/tree.svelte";
  import SummaryCard from "../summary-card.svelte";

  let {
    selected = $bindable(),
    isComparison,
    k8sNode,
  }: {
    isComparison: boolean;
    selected: TreeNode;
    k8sNode: TreeNode<(DataCenter["k8s"] | Comparison<DataCenter["k8s"]>) & {}>;
  } = $props();

  const k8sComparison = k8sNode.data as Comparison<DataCenter["k8s"]>;
  const k8s = k8sNode.data as DataCenter["k8s"];
</script>

<div class="p-4 space-y-4 @container flex flex-col">
  <div
    class="grid grid-cols-1 @xl:grid-cols-2 @4xl:grid-cols-3 max-w-6xl gap-4"
  >
    <SummaryCard
      title="Deployments"
      icon="ant-design--deployment-unit-outlined"
      baseValue={k8s?.deployments?.length || 0}
      {isComparison}
      sourceValue={(k8sComparison.deployments || []).filter(
        (d) => d.status !== "added"
      ).length}
      targetValue={(k8sComparison.deployments || []).filter(
        (d) => d.status !== "removed"
      ).length}
      action={{
        onclick: () => {
          k8sNode.open = true;
          selected =
            k8sNode.children?.find((c) => c.label == "Deployments") || selected;
        },
        label: "Details",
        icon: "mingcute--align-arrow-right-line",
      }}
    />

    <SummaryCard
      title="Stateful Sets"
      icon="eos-icons--stateful-set-outlined"
      baseValue={k8s?.statefulSets?.length || 0}
      {isComparison}
      sourceValue={(k8sComparison.statefulSets || []).filter(
        (d) => d.status !== "added"
      ).length}
      targetValue={(k8sComparison.statefulSets || []).filter(
        (d) => d.status !== "removed"
      ).length}
      action={{
        onclick: () => {
          k8sNode.open = true;
          selected =
            k8sNode.children?.find((c) => c.label == "Stateful Sets") ||
            selected;
        },
        label: "Details",
        icon: "mingcute--align-arrow-right-line",
      }}
    />
  </div>
</div>
