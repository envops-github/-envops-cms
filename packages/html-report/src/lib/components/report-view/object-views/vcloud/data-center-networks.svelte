<script lang="ts">
  import type { DataCenter } from "@envops-cms/model";
  import {
    valueFromComparison,
    type Comparison,
    type PrimitiveComparison,
  } from "@envops-cms/utils";
  import type { TreeNode } from "../../../reusable/tree/tree.svelte";
  import { statusIcon } from "../../report-view.svelte";
  import PropertyTable from "../property-table.svelte";
  import Table, { type Row } from "../../../reusable/table/table.svelte";

  let {
    isComparison,
    networksNode,
  }: {
    isComparison: boolean;
    networksNode: TreeNode<
      (DataCenter<"vCloud"> | Comparison<DataCenter<"vCloud">>) & {}
    >;
  } = $props();

  const dc = networksNode.data as DataCenter<"vCloud">;
</script>

{#snippet NetworkNameCell(
  row: Row<(typeof networksNode.data.networks)[number]>
)}
  {@const comparison = row.data as Comparison<(typeof dc.networks)[number]>}
  {#if isComparison}
    <div class="flex gap-2 items-center">
      <span class={`${statusIcon(comparison.status)} size-5`}></span>
      {valueFromComparison(comparison.name)}
    </div>
  {:else}
    {row.data.name}
  {/if}
{/snippet}

<div class="p-4 space-y-4 @container flex flex-col">
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
      expandable
      pagination
      data={networksNode.data.networks}
      columns={[
        {
          id: "name",
          label: "Name",
          snippet: NetworkNameCell,
        },
      ]}
    >
      {#snippet empty()}
        <p class="p-4 text-gray-500">No networks</p>
      {/snippet}
      {#snippet expandedRowContent(row)}
        <PropertyTable
          {isComparison}
          rows={[
            {
              name: "Name",
              accessor: () => row.data.name,
            },
            {
              name: "IPv4 Range",
              accessor: () => row.data.rangeIpv4,
            },
            {
              name: "IPv4 Range",
              accessor: () => row.data.rangeIpv6,
            }
          ]}
        />
      {/snippet}
    </Table>
  </div>
</div>
