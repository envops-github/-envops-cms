<script lang="ts">
  import type { VCloud } from "@envops-cms/model";
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
    />
  </div>
  <p class="text-xl font-semibold">VMs</p>
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
      data={vappNode.data.vms}
      onRowClick={(row) => {
        vappNode.open = true;

        selected =
          vappNode.children?.find(
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
          snippet: VmNameCell,
        },
        {
          id: "goto",
          label: "",
          snippet: GotoIcon,
        },
      ]}
    >
      {#snippet empty()}
        <p class="p-4 text-gray-500">No Vms</p>
      {/snippet}
    </Table>

    {#snippet VmNameCell(row: Row<(typeof vappNode.data.vms)[number]>)}
      {@const comparison = row.data as Comparison<(typeof vapp.vms)[number]>}
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
