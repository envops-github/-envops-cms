<script lang="ts">
  import type { DataCenter } from "@envops-cms/model";
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
    vappsNode,
    selected = $bindable(),
  }: {
    isComparison: boolean;
    selected: TreeNode;
    vappsNode: TreeNode<
      (DataCenter<"vCloud"> | Comparison<DataCenter<"vCloud">>) & {}
    >;
  } = $props();

  const dcComparison = vappsNode.data as Comparison<DataCenter<"vCloud">>;
  const dc = vappsNode.data as DataCenter<"vCloud">;
</script>

<div class="p-4 space-y-4 @container flex flex-col">
  <div
    class="grid grid-cols-1 @xl:grid-cols-2 @4xl:grid-cols-3 max-w-6xl gap-4"
  >
    <SummaryCard
      title="vApps"
      icon="tdesign--app"
      baseValue={dc.networks.length}
      {isComparison}
      sourceValue={dcComparison.vApps.filter((n) => n.status !== "added")
        .length}
      targetValue={dcComparison.vApps.filter((n) => n.status !== "removed")
        .length}
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
  <p class="text-xl font-semibold">vApps</p>

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
      data={vappsNode.data.vApps}
      onRowClick={(row) => {
        vappsNode.open = true;
        selected =
          vappsNode.children?.find(
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
          snippet: vAppNameCell,
        },
        {
          id: "goto",
          label: "",
          snippet: GotoIcon,
        },
      ]}
    >
      {#snippet empty()}
        <p class="p-4 text-gray-500">No vApps</p>
      {/snippet}
    </Table>

    {#snippet vAppNameCell(row: Row<(typeof vappsNode.data.vApps)[number]>)}
      {@const comparison = row.data as Comparison<(typeof dc.vApps)[number]>}
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
