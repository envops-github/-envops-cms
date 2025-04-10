<script lang="ts">
  import PropertyTable from "./../property-table.svelte";
  import type { Pod, VCloud } from "@envops-cms/model";
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
    podNode,
  }: {
    isComparison: boolean;
    podNode: TreeNode<(Pod | Comparison<Pod>) & {}>;
  } = $props();

  const pod = podNode.data as Pod;
  const podComparison = podNode.data as Comparison<Pod>;
</script>

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
            name: "Name",
            accessor: () => pod.name,
          },
        ]}
      />
    </Tabs.Tab>
    <Tabs.Tab
      tab={{
        id: "software",
        icon: "eos-icons--software",
        label: "Software Versions",
      }}
    >
      {#if pod.versions?.length}
        <PropertyTable
          {isComparison}
          rows={isComparison
            ? (podComparison.versions || []).map((d) => ({
                name: valueFromComparison(d.name),
                accessor: () => d.version,
              }))
            : pod.versions.map((d) => ({
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
