<script lang="ts">
  import envopsLogo from "./assets/envops.svg";
  import Navbar from "./lib/components/navbar/navbar.svelte";
  import { ThemeController } from "./lib/theme";
  import type { ComparisonReportData, ModelReportData } from "./main";
  import ModelReport from "./lib/components/model-report/model-report.svelte";
  import ComparisonReport from "./lib/components/comparison-report/comparison-report.svelte";

  let {
    modelReport,
    comparisonReport,
  }: {
    modelReport?: ModelReportData;
    comparisonReport?: ComparisonReportData;
  } = $props();

  console.log(modelReport);
  console.log(comparisonReport);
</script>

<svelte:head>
  <title>Envops Studio</title>

  <link rel="icon" type="image/svg+xml" href={decodeURI(envopsLogo)} />
</svelte:head>

<ThemeController />

<main class="flex flex-col w-full h-full">
  <Navbar />

  {#if !modelReport && !comparisonReport}
    <div class="w-full h-full p-8 text-center">Report data not found</div>
  {/if}

  {#if modelReport}
    <ModelReport {modelReport} />
  {/if}

  {#if comparisonReport}
    <ComparisonReport {comparisonReport} />
  {/if}
</main>
