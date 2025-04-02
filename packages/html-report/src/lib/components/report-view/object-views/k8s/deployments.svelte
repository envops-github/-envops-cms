<script lang="ts">
  import type { DataCenter, Deployment } from "@envops-cms/model";
  import {
    valueFromComparison,
    type Comparison,
    type PrimitiveComparison,
  } from "@envops-cms/utils";
  import type { TreeNode } from "../../../reusable/tree/tree.svelte";
  import SummaryCard from "../summary-card.svelte";
  import { statusIcon } from "../../report-view.svelte";
  import Table, { type Row } from "../../../reusable/table/table.svelte";

  let {
    isComparison,
    k8sNode,
    selected = $bindable(),
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
        (n) => n.status !== "added"
      ).length}
      targetValue={(k8sComparison.deployments || []).filter(
        (n) => n.status !== "removed"
      ).length}
    />
  </div>
  <p class="text-xl font-semibold">Deployments</p>

  <div class="flex flex-col gap-2 min-w-fit max-w-6xl">
    <Table
      headerless
      filter={(value, row) => {
        let name = row.data.name;
        if (isComparison) {
          name = valueFromComparison(name as PrimitiveComparison);
        }

        return (name as string)
          .toLocaleLowerCase()
          .includes(value.toLocaleLowerCase());
      }}
      pagination
      data={k8sNode.data.deployments}
      onRowClick={(row) => {
        selected =
          k8sNode.children
            ?.find((c) => c.label == "Deployments")
            ?.children?.find(
              (c) =>
                c.label ==
                (isComparison
                  ? valueFromComparison(row.data.name as PrimitiveComparison)
                  : row.data.name)
            ) || selected;
      }}
      columns={[
        {
          id: "name",
          label: "Name",
          snippet: DeploymentNameCell,
        },
        {
          id: "goto",
          label: "",
          snippet: GotoIcon,
        },
      ]}
    >
      {#snippet empty()}
        <p class="p-4 text-gray-500">No Deployments</p>
      {/snippet}
    </Table>

    {#snippet DeploymentNameCell(row: Row<Deployment | Comparison<Deployment>>)}
      {@const comparison = row.data as Comparison<Deployment>}
      {#if isComparison}
        <div class="flex gap-2 items-center">
          <span class={`${statusIcon(comparison.status)} size-5`}></span>
          {valueFromComparison(comparison.name)}
        </div>
      {:else}
        {row.data.name}
      {/if}
    {/snippet}

    {#snippet GotoIcon()}
      <div class="w-full flex justify-end">
        <span class="size-5 mingcute--align-arrow-right-line"> </span>
      </div>
    {/snippet}
  </div>
</div>
