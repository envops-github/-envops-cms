<script lang="ts" module>
  export type ViewType =
    // vCloud
    | "vcloud.dc"
    | "vcloud.dc.vapps"
    | "vcloud.dc.vapp"
    | "vcloud.dc.vapps.vms"
    | "vcloud.dc.vapps.vm"
    | "vcloud.dc.vapp.networks"
    | "vcloud.dc.vapp.storage"
    | "vcloud.dc.networks"
    | "vcloud.dc.storage"
    // Bare Metal
    | "baremetal.dc"
    | "baremetal.dc.machines"
    | "baremetal.dc.machine"
    // AWS
    | "aws.dc"
    //K8s
    | "k8s"
    | "k8s.statefulsets"
    | "k8s.deployments"
    | "k8s.deployment"
    | "k8s.statefulset"
    | "k8s.pod";
</script>

<script lang="ts">
  import type {
    DataCenter,
    Deployment,
    Pod,
    StatefulSet,
    VCloud,
  } from "@envops-cms/model";
  import { valueFromComparison, type Comparison } from "@envops-cms/utils";
  import ObjectViewHeader from "./object-view-header.svelte";
  import type { TreeNode } from "../reusable/tree/tree.svelte";
  import * as VCloudViews from "./object-views/vcloud";
  import * as BareMetalViews from "./object-views/bare-metal";

  import K8s from "./object-views/k8s/k8s.svelte";
  import Deployments from "./object-views/k8s/deployments.svelte";
  import Statefulsets from "./object-views/k8s/statefulsets.svelte";
  import DeploymentView from "./object-views/k8s/deployment.svelte";
  import Statefulset from "./object-views/k8s/statefulset.svelte";
  import PodView from "./object-views/k8s/pod.svelte";
  let { selected = $bindable() }: { selected: TreeNode } = $props();

  const isComparison = selected.data?.hasOwnProperty("status");
</script>

<div class="h-full flex flex-col overflow-auto">
  <!-- BareMetal -->

  {#if selected.data.type == "baremetal.dc"}
    {@const dc = selected.data as DataCenter<"BareMetal">}
    {@const comparisonDc = selected.data as Comparison<DataCenter<"BareMetal">>}
    <ObjectViewHeader
      name={isComparison ? valueFromComparison(comparisonDc.name) : dc.name}
      icon="carbon--data-center"
      type="Data Center"
      badge={{ label: "BareMetal", class: "bg-purple-600" }}
    />
    <BareMetalViews.DataCenter
      bind:selected
      {isComparison}
      dataCenterNode={selected}
    />
  {/if}

  {#if selected.data.type == "baremetal.dc.machines"}
    {@const dc = selected.data as DataCenter<"BareMetal">}
    {@const comparisonDc = selected.data as Comparison<DataCenter<"BareMetal">>}
    <ObjectViewHeader
      name={isComparison ? valueFromComparison(comparisonDc.name) : dc.name}
      icon="ix--screens"
      type="Machines"
      badge={{ label: "BareMetal", class: "bg-purple-600" }}
    />
    <BareMetalViews.Machines
      bind:selected
      {isComparison}
      machinesNode={selected}
    />
  {/if}

  {#if selected.data.type == "baremetal.dc.machine"}
    {@const dc = selected.parent?.data as DataCenter<"BareMetal">}
    {@const comparisonDc = selected.parent?.data as Comparison<
      DataCenter<"BareMetal">
    >}
    <ObjectViewHeader
      name={isComparison ? valueFromComparison(comparisonDc.name) : dc.name}
      icon="codicon--vm"
      type="Machine"
      badge={{ label: "BareMetal", class: "bg-purple-600" }}
    />
    <BareMetalViews.Machine
      {isComparison}
      machineNode={selected}
    />
  {/if}

  <!-- vCloud -->

  {#if selected.data.type == "vcloud.dc"}
    {@const dc = selected.data as DataCenter<"vCloud">}
    {@const comparisonDc = selected.data as Comparison<DataCenter<"vCloud">>}
    <ObjectViewHeader
      name={isComparison ? valueFromComparison(comparisonDc.name) : dc.name}
      icon="carbon--data-center"
      type="Data Center"
      badge={{ label: "vCloud" }}
    />
    <VCloudViews.DataCenter
      bind:selected
      {isComparison}
      dataCenterNode={selected}
    />
  {/if}

  {#if selected.data.type == "vcloud.dc.vapps"}
    {@const dc = selected.data as DataCenter<"vCloud">}
    {@const comparisonDc = selected.data as Comparison<DataCenter<"vCloud">>}
    <ObjectViewHeader
      name={isComparison ? valueFromComparison(comparisonDc.name) : dc.name}
      icon="tdesign--app"
      type="vApps"
      badge={{ label: `vCloud` }}
    />
    <VCloudViews.VApps bind:selected {isComparison} vappsNode={selected} />
  {/if}

  {#if selected.data.type == "vcloud.dc.vapp"}
    {@const vapp = selected.data as VCloud.vApp}
    {@const comparisonVApp = selected.data as Comparison<VCloud.vApp>}

    <ObjectViewHeader
      name={isComparison ? valueFromComparison(comparisonVApp.name) : vapp.name}
      icon="clarity--vmw-app-line"
      type="vApp"
      badge={{ label: `vCloud` }}
    />
    <VCloudViews.VApp bind:selected {isComparison} vappNode={selected} />
  {/if}

  {#if selected.data.type == "vcloud.dc.networks"}
    {@const dc = selected.data as DataCenter<"vCloud">}
    {@const comparisonDc = selected.data as Comparison<DataCenter<"vCloud">>}
    <ObjectViewHeader
      name={isComparison ? valueFromComparison(comparisonDc.name) : dc.name}
      icon="icon-park-outline--network-tree"
      type="Networks"
      badge={{ label: `vCloud` }}
    />
    <VCloudViews.DCNetworks {isComparison} networksNode={selected} />
  {/if}

  {#if selected.data.type == "vcloud.dc.storage"}
    {@const dc = selected.data as DataCenter<"vCloud">}
    {@const comparisonDc = selected.data as Comparison<DataCenter<"vCloud">>}

    <ObjectViewHeader
      name={isComparison ? valueFromComparison(comparisonDc.name) : dc.name}
      icon="material-symbols--storage"
      type="Storage"
      badge={{ label: `vCloud` }}
    />

    <VCloudViews.DataCenterStorage {isComparison} storageNode={selected} />
  {/if}

  {#if selected.data.type == "vcloud.dc.vapps.vm"}
    {@const vm = selected.data as VCloud.vm}
    {@const comparisonVm = selected.data as Comparison<VCloud.vm>}

    <ObjectViewHeader
      name={isComparison
        ? valueFromComparison(comparisonVm.hostname)
        : vm.hostname}
      icon="codicon--vm"
      type="VM"
      badge={{ label: `vCloud` }}
    />

    <VCloudViews.Vm {isComparison} vmNode={selected} />
  {/if}

  {#if selected.data.type == "vcloud.dc.vapp.networks"}
    {@const vapp = selected.data as VCloud.vApp}
    {@const comparisonVApp = selected.data as Comparison<VCloud.vApp>}
    <ObjectViewHeader
      name={isComparison ? valueFromComparison(comparisonVApp.name) : vapp.name}
      icon="icon-park-outline--network-tree"
      type="vApp Networks"
      badge={{ label: `vCloud` }}
    />
    <VCloudViews.VAppNetworks {isComparison} vappNetworksNode={selected} />
  {/if}

  {#if selected.data.type == "vcloud.dc.vapp.storage"}
    {@const vapp = selected.data as VCloud.vApp}
    {@const comparisonVApp = selected.data as Comparison<VCloud.vApp>}

    <ObjectViewHeader
      name={isComparison ? valueFromComparison(comparisonVApp.name) : vapp.name}
      icon="material-symbols--storage"
      type="vApp Storage"
      badge={{ label: `vCloud` }}
    />

    <VCloudViews.VAppStorage {isComparison} vappStorageNode={selected} />
  {/if}

  <!-- AWS -->

  {#if selected.data.type == "aws.dc"}
    {@const dc = selected.data as DataCenter<"AWS">}
    {@const comparisonDc = selected.data as Comparison<DataCenter<"AWS">>}

    <ObjectViewHeader
      name={isComparison ? valueFromComparison(comparisonDc.name) : dc.name}
      icon="carbon--data-center"
      type="Data Center"
      badge={{ label: "AWS", class: "bg-yellow-600" }}
    />
  {/if}

  <!-- K8S -->

  {#if selected.data.type == "k8s"}
    {@const dc = selected.parent?.data as DataCenter}
    {@const comparisonDc = selected.parent?.data as Comparison<DataCenter>}

    <ObjectViewHeader
      name={isComparison ? valueFromComparison(comparisonDc.name) : dc.name}
      icon="mdi--kubernetes"
      type="K8S"
    />

    <K8s {isComparison} bind:selected k8sNode={selected} />
  {/if}

  {#if selected.data.type == "k8s.deployments"}
    {@const dc = selected.parent?.parent?.data as DataCenter}
    {@const comparisonDc = selected.parent?.parent
      ?.data as Comparison<DataCenter>}

    <ObjectViewHeader
      name={isComparison ? valueFromComparison(comparisonDc.name) : dc.name}
      icon="ant-design--deployment-unit-outlined"
      type="K8S Deployments"
    />

    <Deployments
      {isComparison}
      bind:selected
      k8sNode={selected.parent as TreeNode}
    />
  {/if}

  {#if selected.data.type == "k8s.statefulsets"}
    {@const dc = selected.parent?.parent?.data as DataCenter}
    {@const comparisonDc = selected.parent?.parent
      ?.data as Comparison<DataCenter>}

    <ObjectViewHeader
      name={isComparison ? valueFromComparison(comparisonDc.name) : dc.name}
      icon="eos-icons--stateful-set-outlined"
      type="K8S Stateful Sets"
    />

    <Statefulsets
      {isComparison}
      bind:selected
      k8sNode={selected.parent as TreeNode}
    />
  {/if}

  {#if selected.data.type == "k8s.deployment"}
    {@const deployment = selected.data as Deployment}
    {@const comparisonDeployment = selected.data as Comparison<Deployment>}

    <ObjectViewHeader
      name={isComparison
        ? valueFromComparison(comparisonDeployment.name)
        : deployment.name}
      icon="ant-design--deployment-unit-outlined"
      type="K8S Deployment"
    />

    <DeploymentView {isComparison} bind:selected deploymentNode={selected} />
  {/if}

  {#if selected.data.type == "k8s.statefulset"}
    {@const set = selected.data as StatefulSet}
    {@const comparisonSet = selected.data as Comparison<StatefulSet>}

    <ObjectViewHeader
      name={isComparison ? valueFromComparison(comparisonSet.name) : set.name}
      icon="eos-icons--stateful-set-outlined"
      type="K8S Stateful Set"
    />
    <Statefulset {isComparison} bind:selected statefulSetNode={selected} />
  {/if}

  {#if selected.data.type == "k8s.pod"}
    {@const pod = selected.data as Pod}
    {@const comparisonPod = selected.data as Comparison<Pod>}

    <ObjectViewHeader
      name={isComparison ? valueFromComparison(comparisonPod.name) : pod.name}
      icon="clarity--pod-line"
      type="K8S Pod"
    />

    <PodView {isComparison} podNode={selected} />
  {/if}
</div>
