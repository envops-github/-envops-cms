<script lang="ts">
  import type { VCloud } from "@envops-cms/model";
  import { type Comparison } from "@envops-cms/utils";
  import type { TreeNode } from "../../../reusable/tree/tree.svelte";
  import PropertyTable from "../property-table.svelte";

  let {
    isComparison,
    networkNode,
  }: {
    isComparison: boolean;
    networkNode: TreeNode<
      (VCloud.DCNetwork | Comparison<VCloud.DCNetwork>) & {}
    >;
  } = $props();

  const network = networkNode.data as VCloud.DCNetwork;

  const rows = [
    {
      name: "Name",
      accessor: () => network.name,
    },
    // {
    //   name: "OS",
    //   accessor: () => (isComparison ? vmComparison.os : vm.os),
    // },
    {
      name: "Gateway IPv4",
      accessor: () => network.gatewayIpv4,
    },
    {
      name: "Subnet IPv4",
      accessor: () => network.subnetIpv4,
    },
    {
      name: "Gateway IPv6",
      accessor: () => network.gatewayIpv6,
    },
    {
      name: "Subnet IPv6",
      accessor: () => network.subnetIpv6,
    },
  ];
</script>

<div class="p-4 space-y-4 @container flex flex-col">
  <PropertyTable {isComparison} {rows} />
</div>
