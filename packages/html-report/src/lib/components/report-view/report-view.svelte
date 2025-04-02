<script lang="ts" module>
  import type { ComparisonStatus } from "@envops-cms/utils";

  export function statusIcon(status: ComparisonStatus) {
    switch (status) {
      case "added":
        return "mdi--plus-circle-outline text-red-500";

      case "changed":
        return "mdi--alert-decagram text-yellow-500";

      case "unchanged":
        return "mdi--check-decagram text-green-500";

      case "removed":
        return "mdi--minus-circle-outline text-red-500";
      default:
        return "mdi--question-mark-circle-outline text-purple-500";
    }
  }
</script>

<script lang="ts">
  import type { ComparisonReportData, ModelReportData } from "../../../main";
  import { PaneGroup, Pane, PaneResizer } from "paneforge";
  import ReportTreeView from "./report-tree-view/report-tree-view.svelte";
  import ReportObjectView from "./report-object-view.svelte";
  import type { TreeNode } from "../reusable/tree/tree.svelte";
  import { tick } from "svelte";

  let {
    modelReport,
    comparisonReport,
  }: {
    modelReport?: ModelReportData;
    comparisonReport?: ComparisonReportData;
  } = $props();

  let filterValue = $state("");

  let selected: TreeNode | undefined = $state(undefined);
  let tree = $state([]);

</script>

<div class="p-4 border-b">
  <label class="input w-md">
    <span class="size-6 text-base-content mdi--filter-outline"></span>
    <input
      bind:value={filterValue}
      type="search"
      class="grow"
      placeholder="Filter"
    />
  </label>
</div>

<div class="flex-1 overflow-hidden">
  <PaneGroup direction="horizontal">
    <Pane class="" minSize={20} maxSize={50} defaultSize={30}>
      <div class="overflow-auto flex flex-col h-full">
        <ReportTreeView
          bind:tree
          bind:selected
          {modelReport}
          {comparisonReport}
          {filterValue}
        />
      </div>
    </Pane>
    <PaneResizer
      class="relative h-full flex w-[1px] items-center justify-center bg-border"
    >
      <div
        class="z-10 flex h-8 w-4 items-center justify-center rounded-sm bg-neutral-300"
      >
        <span class="mingcute--dots-line size-5 text-neutral-600"></span>
      </div>
    </PaneResizer>
    <Pane class="" defaultSize={70}>
      <div class="overflow-auto flex flex-col h-full">
        {#if !selected}
          <p class="w-full p-4 text-gray-500">
            Selected objects will be viewed here.
          </p>
        {/if}

        {#key selected}
          {#if selected}
            <ReportObjectView bind:selected />
          {/if}
        {/key}
      </div>
    </Pane>
  </PaneGroup>
</div>
