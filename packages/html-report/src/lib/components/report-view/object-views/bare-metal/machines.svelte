<script lang="ts">
  import type { DataCenter } from "@envops-cms/model";
  import {
    valueFromComparison,
    type Comparison,
    type PrimitiveComparison,
  } from "@envops-cms/utils";
  import type { TreeNode } from "../../../reusable/tree/tree.svelte";
  import SummaryCard from "../summary-card.svelte";
  import Table, { type Row } from "../../../reusable/table/table.svelte";
  import { statusIcon } from "../../report-view.svelte";

  let {
    selected = $bindable(),
    isComparison,
    machinesNode,
  }: {
    isComparison: boolean;
    selected: TreeNode;
    machinesNode: TreeNode<
      (DataCenter<"BareMetal"> | Comparison<DataCenter<"BareMetal">>) & {}
    >;
  } = $props();

  const dcComparison = machinesNode.data as Comparison<DataCenter<"BareMetal">>;
  const dc = machinesNode.data as DataCenter<"BareMetal">;
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
    />
  </div>

  <p class="text-xl font-semibold">Machines</p>

  <div class="flex flex-col gap-2 min-w-fit max-w-6xl">
    <Table
      headerless
      filter={(value, row) => {
        let name = row.data.hostname;
        if (isComparison) {
          name = valueFromComparison(name as PrimitiveComparison);
        }

        return (name as string)
          .toLocaleLowerCase()
          .includes(value.toLocaleLowerCase());
      }}
      pagination
      data={machinesNode.data.machines}
      onRowClick={(row) => {
        machinesNode.open = true;
        selected =
          machinesNode.children?.find(
            (c) =>
              c.label ==
              (isComparison
                ? valueFromComparison(row.data.hostname as PrimitiveComparison)
                : row.data.hostname)
          ) || selected;
      }}
      columns={[
        {
          id: "name",
          label: "Name",
          snippet: MachineNameCell,
        },
        {
          id: "goto",
          label: "",
          snippet: GotoIcon,
        },
      ]}
    >
      {#snippet empty()}
        <p class="p-4 text-gray-500">No Machines</p>
      {/snippet}
    </Table>

    {#snippet MachineNameCell(
      row: Row<(typeof machinesNode.data.machines)[number]>
    )}
      {@const comparison = row.data as Comparison<(typeof dc.machines)[number]>}
      {#if isComparison}
        <div class="flex gap-2 items-center">
          <span class={`${statusIcon(comparison.status)} size-5`}></span>
          {valueFromComparison(comparison.hostname)}
        </div>
      {:else}
        {row.data.hostname}
      {/if}
    {/snippet}

    {#snippet GotoIcon()}
      <div class="w-full flex justify-end">
        <span class="size-5 mingcute--align-arrow-right-line"> </span>
      </div>
    {/snippet}
  </div>
</div>
