<script lang="ts">
  import type { MaybePromise } from "@envops-cms/utils";
  import { statusIcon } from "../report-view.svelte";

  let {
    title,
    icon,
    isComparison,
    baseValue,
    sourceValue,
    targetValue,
    unit,
    action,
  }: {
    title: string;
    baseValue: string | number;
    sourceValue?: string | number;
    targetValue?: string | number;
    unit?: string;
    icon?: string;
    isComparison?: boolean;
    action?: { onclick?: () => MaybePromise; label?: string; icon?: string };
  } = $props();
</script>

<div class="card border w-full shadow bg-base-200">
  <div class="card-title text-nowrap p-4">
    <span class="{icon} size-8 shrink-0"></span>

    <p>{title}</p>
    <div class="w-full"></div>
    {#if !isComparison}
      <div class="flex text-nowrap items-end gap-1">
        <p>{baseValue}</p>
        {#if unit}
          <p class="text-sm/6">{unit}</p>
        {/if}
      </div>
    {/if}
    {#if isComparison}
      <span
        class="{statusIcon(
          sourceValue !== targetValue ? 'changed' : 'unchanged'
        )} size-6 shrink-0"
      ></span>
    {/if}
  </div>
  {#if !isComparison && action}
    <div class="card-body pt-0 flex flex-row justify-end">
      <button class="btn btn-primary btn-sm" onclick={action.onclick}>
        {action.label}
        {#if action.icon}
          <span class="{action.icon} size-4"></span>
        {/if}
      </button>
    </div>
  {/if}
  {#if isComparison}
    <div class="card-body pt-0 flex flex-row justify-between items-end">
      <div class="flex items-center justify-between h-full w-fit gap-4">
        <div>
          <p class="text-xs text-gray-500">Expected</p>
          <p class="text-lg">
            {sourceValue}
            {#if unit}
              <span class="text-sm/6">{unit}</span>
            {/if}
          </p>
        </div>
        <div class="divider-vertical w-0.5 h-full bg-border"></div>
        <div>
          <p class="text-xs text-gray-500">Found</p>
          <p class="text-lg">
            {targetValue}
            {#if unit}
              <span class="text-sm/6">{unit}</span>
            {/if}
          </p>
        </div>
      </div>
      {#if action}
        <button class="btn btn-primary btn-sm" onclick={action.onclick}>
          {action.label}
          {#if action.icon}
            <span class="{action.icon} size-4"></span>
          {/if}
        </button>
      {/if}
    </div>
  {/if}
</div>
