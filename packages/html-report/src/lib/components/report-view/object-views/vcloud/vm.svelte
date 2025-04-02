<script lang="ts">
  import PropertyTable from "./../property-table.svelte";
  import type { VCloud } from "@envops-cms/model";
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
    vmNode,
  }: {
    isComparison: boolean;
    vmNode: TreeNode<(VCloud.vm | Comparison<VCloud.vm>) & {}>;
  } = $props();

  const vm = vmNode.data as VCloud.vm;
  const vmComparison = vmNode.data as Comparison<VCloud.vm>;

</script>

{#snippet NicNameCell(row: Row<(typeof vmNode.data.nics)[number]>)}
  {@const comparison = row.data as Comparison<(typeof vm.nics)[number]>}
  {#if isComparison}
    <div class="flex gap-2 items-center">
      <span class={`${statusIcon(comparison.status)} size-5`}></span>
      {valueFromComparison(comparison.name)}
    </div>
  {:else}
    {row.data.name}
  {/if}
{/snippet}

{#snippet DiskIndexCell(row: Row<(typeof vmNode.data.disks)[number]>)}
  {@const comparison = row.data as Comparison<(typeof vm.disks)[number]>}
  {@const diskIndex = vm.disks.findIndex((disk) => disk === row.data)}
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
            accessor: () => vm.hostname,
          },
          {
            name: "OS",
            accessor: () => vm.osType,
          },
          {
            name: "Hardware Version",
            accessor: () => vm.hardwareVersion,
          },
          {
            name: "VM Tool Version",
            accessor: () => vm.vmToolsVersion,
          },
          {
            name: "CPU Cores",
            accessor: () => vm.cpuCores,
          },
          {
            name: "Memory",
            unit: "GB",
            accessor: () => vm.memoryGb,
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
        data={vmNode.data.nics}
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
                name: "Adapter Type",
                accessor: () => row.data.adapterType,
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
        data={vmNode.data.disks}
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
                name: "Storage Profile",
                accessor: () => row.data.storageProfile,
              },
              {
                name: "Size",
                unit: "GB",
                accessor: () => row.data.sizeGb,
              },
              {
                name: "Bus Number",
                accessor: () => row.data.busNumber,
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
      {#if vm.versions.length}
        <PropertyTable
          {isComparison}
          rows={isComparison
            ? vmComparison.versions.map((d) => ({
                name: valueFromComparison(d.name),
                accessor: () => d.version,
              }))
            : vm.versions.map((d) => ({
                name: d.name,
                accessor: () => d.version,
              }))}
        />
      {/if}
    </Tabs.Tab>
  </Tabs.Root>
</div>
