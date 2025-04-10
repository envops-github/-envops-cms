<script lang="ts">
  import type { PrimitiveComparison } from "@envops-cms/utils";
  import { statusIcon } from "../report-view.svelte";

  let {
    isComparison,
    rows,
  }: {
    isComparison: boolean;
    rows: {
      name: string;
      accessor?: (
        rowNumber: number
      ) => (string | number | boolean) | PrimitiveComparison;
      unit?: string;
    }[];
  } = $props();
</script>

<div class="overflow-x-auto">
  <table class="table table-sm">
    <thead>
      <tr class="text-xs">
        <th class="w-0 min-w-48">Property</th>
        {#if isComparison}
          <th class="w-0 min-w-48">Expected</th>
          <th class=" min-w-48">Found</th>
        {:else}
          <th class="min-w-48">Value</th>
        {/if}
      </tr>
    </thead>
    <tbody>
      {#each rows as { name, accessor, unit }, rowNumber}
        {@const value = accessor?.(rowNumber) as string | number}
        {@const comaprisonValue = accessor?.(rowNumber) as PrimitiveComparison}

        <tr class="hover:bg-base-200 text-nowrap">
          <td>
            <div class="flex w-fit items-center gap-2">
              {#if isComparison}
                <span class="{statusIcon(comaprisonValue?.status)} size-5"
                ></span>
              {/if}
              <p>
                {name}
              </p>
            </div>
          </td>
          {#if isComparison}
            <td>
              <span class="mdi {statusIcon(comaprisonValue?.status)}"></span>
              {comaprisonValue?.source}
              {#if unit && comaprisonValue?.source}
                {unit}
              {/if}
            </td>
            <td>
              <span class="mdi {statusIcon(comaprisonValue?.status)}"></span>
              {comaprisonValue?.target}
              {#if unit && comaprisonValue?.target}
                {unit}
              {/if}
            </td>
          {:else}
            <td
              >{value}
              {#if unit && value}
                {unit}
              {/if}
            </td>
          {/if}
        </tr>
      {/each}
    </tbody>
  </table>
</div>
