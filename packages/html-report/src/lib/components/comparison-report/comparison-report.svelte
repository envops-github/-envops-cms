<script lang="ts">
  import type { ModelMetadata } from "@envops-cms/model";
  import type { ComparisonReportData } from "../../../main";
  import ReportView from "../report-view/report-view.svelte";
  import { firstToUpperCase } from "@envops-cms/utils/str";
  let { comparisonReport }: { comparisonReport: ComparisonReportData } =
    $props();
</script>

{#snippet metadata(metadata: ModelMetadata)}
  {#if metadata.type == "scan"}
    <p class="text-gray-500">Environment</p>
    <p>{metadata.data.environmentName}</p>
    <p class="text-gray-500">Version</p>
    <p>{metadata.data.environmentVersionName}</p>
    <p class="text-gray-500">Scanned At</p>
    <p>{new Date(metadata.data.startTime).toLocaleString()}</p>
  {/if}

  {#if metadata.type == "environment"}
    <p class="text-gray-500">Name</p>
    <p>{metadata.data.environment.name}</p>
    <p class="text-gray-500">Version</p>
    <p>{metadata.data.version.name}</p>
    <p class="text-gray-500">Created At</p>
    <p>{new Date(metadata.data.version.createdAt).toLocaleDateString()}</p>
  {/if}
{/snippet}

<div class="w-full p-4 border-b bg-base-200 space-y-4">
  <p class="text-lg font-semibold">Comparison Report</p>
  <div class="w-full max-w-xl grid grid-cols-1 gap-x-4 min-[480px]:grid-cols-2">
    <div class="grid grid-cols-2 gap-1 max-w-sm text-sm bg-base-100 p-2 shadow">
      <p class="font-semibold col-span-2">Source</p>
      <p class="text-gray-500">Type</p>
      <p>{firstToUpperCase(comparisonReport.metadata.source.type)}</p>
      {@render metadata(comparisonReport.metadata.source)}
    </div>

    <div class="grid grid-cols-2 gap-1 max-w-sm text-sm bg-base-100 p-2 shadow">
      <p class="font-semibold col-span-2">Target</p>
      <p class="text-gray-500">Type</p>
      <p>{firstToUpperCase(comparisonReport.metadata.target.type)}</p>
      {@render metadata(comparisonReport.metadata.target)}
    </div>
  </div>
</div>

<ReportView {comparisonReport} />
