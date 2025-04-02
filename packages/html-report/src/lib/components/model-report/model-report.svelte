<script lang="ts">
  import type { ModelReportData } from "../../../main";
  import ReportView from "../report-view/report-view.svelte";

  let { modelReport }: { modelReport: ModelReportData } = $props();
</script>

<div class="w-full p-4 border-b bg-base-200">
  <div class="grid grid-cols-2 gap-1 max-w-lg">
    <text class="font-semibold">Environment</text><text>{modelReport.environment.name}</text
    >
    <text class="font-semibold">Version</text><text>{modelReport.version.name}</text>
    <text class="font-semibold">Version Date</text><text
      >{new Date(modelReport.version.createdAt).toLocaleDateString()}</text
    >
  </div>
</div>

<ReportView {modelReport} />
