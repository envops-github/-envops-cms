<script lang="ts">
  import PropertyTable from "./../property-table.svelte";
  import type { BareMetal } from "@envops-cms/model";
  import {
    valueFromComparison,
    type Comparison,
    type PrimitiveComparison,
  } from "@envops-cms/utils";
  import type { TreeNode } from "../../../reusable/tree/tree.svelte";
  import * as Tabs from "../../../reusable/tabs";
  import Table, { type Row } from "../../../reusable/table/table.svelte";
  import { statusIcon } from "../../report-view.svelte";

  let {
    isComparison,
    machineNode,
  }: {
    isComparison: boolean;
    machineNode: TreeNode<
      (BareMetal.Machine | Comparison<BareMetal.Machine>) & {}
    >;
  } = $props();

  const machine = machineNode.data as BareMetal.Machine;
  const machineComparison = machineNode.data as Comparison<BareMetal.Machine>;
</script>

{#snippet NicNameCell(row: Row<(typeof machineNode.data.nics)[number]>)}
  {@const comparison = row.data as Comparison<(typeof machine.nics)[number]>}
  {#if isComparison}
    <div class="flex gap-2 items-center">
      <span class={`${statusIcon(comparison.status)} size-5`}></span>
      {valueFromComparison(comparison.name)}
    </div>
  {:else}
    {row.data.name}
  {/if}
{/snippet}

{#snippet DiskIndexCell(row: Row<(typeof machineNode.data.disks)[number]>)}
  {@const comparison = row.data as Comparison<(typeof machine.disks)[number]>}
  {@const diskIndex = machine.disks.findIndex((disk) => disk === row.data)}
  {#if isComparison}
    <div class="flex gap-2 items-center">
      <span class={`${statusIcon(comparison.status)} size-5`}></span>
      {`Disk ${diskIndex}`}
    </div>
  {:else}
    {`Disk${diskIndex}`}
  {/if}
{/snippet}

<div class="@container flex flex-col h-full">
  <Tabs.Root>
    <Tabs.Tab
      tab={{
        id: "general",
        checked: true,
        icon: "mdi--cog",
        label: "General",
      }}
    >
      <PropertyTable
        {isComparison}
        rows={[
          {
            name: "Hostname",
            accessor: () => machine.hostname,
          },
          {
            name: "OS",
            accessor: () => machine.osName,
          },
          {
            name: "OS Version",
            accessor: () => machine.osVersion,
          },
          {
            name: "CPU Cores",
            accessor: () => machine.cpuCores,
          },
          {
            name: "Memory",
            unit: "GB",
            accessor: () => machine.memoryGb,
          },
        ]}
      />
    </Tabs.Tab>

    <Tabs.Tab
      tab={{
        id: "networks",
        icon: "mdi--network-interface-card",
        label: "Networks",
      }}
    >
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
        data={machineNode.data.nics}
        columns={[
          {
            id: "name",
            label: "Name",
            snippet: NicNameCell,
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
                name: "Interface",
                accessor: () => row.data.name,
              },
              {
                name: "MAC",
                accessor: () => row.data.mac,
              },
              {
                name: row.data.ipv4Address ? "IPv4 Address" : "IPv6 Address",
                accessor: () =>
                  row.data.ipv4Address
                    ? row.data.ipv4Address || true
                    : row.data.ipv6Address || true,
              },
            ]}
          />
        {/snippet}
      </Table>
    </Tabs.Tab>
    <Tabs.Tab
      tab={{
        id: "storage",
        icon: "material-symbols--hard-disk",
        label: "Storage",
      }}
    >
      <Table
        headerless
        filter={(value, row) => {
          const name = `Disk ${row.i}`;

          return (name as string)
            .toLocaleLowerCase()
            .includes(value.toLocaleLowerCase());
        }}
        expandable
        pagination
        data={machineNode.data.disks}
        columns={[
          {
            id: "index",
            label: "Index",
            snippet: DiskIndexCell,
          },
        ]}
      >
        {#snippet empty()}
          <p class="p-4 text-gray-500">No disks</p>
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
                name: "Size",
                unit: "GB",
                accessor: () => row.data.sizeGb,
              },
            ]}
          />
        {/snippet}
      </Table>
    </Tabs.Tab>
    <Tabs.Tab
      tab={{
        id: "software",
        icon: "eos-icons--software",
        label: "Software Versions",
      }}
    >
      {#if machine.versions?.length}
        <PropertyTable
          {isComparison}
          rows={isComparison
            ? (machineComparison.versions || []).map((d) => ({
                name: valueFromComparison(d.name),
                accessor: () => d.version,
              }))
            : machine.versions.map((d) => ({
                name: d.name,
                accessor: () => d.version,
              }))}
        />
      {:else}
        <p class="text-gray-500">No software versions</p>
      {/if}
    </Tabs.Tab>
  </Tabs.Root>
</div>
