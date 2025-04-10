<script lang="ts" module>
  export type Tab = {
    id: string;
    label?: string;
    icon?: string;
    checked?: boolean;
  };
</script>

<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  let {
    tab,
    children,
    trigger,
    ...rest
  }: {
    tab: Tab;
    children?: Snippet;
    trigger?: Snippet;
  } & HTMLAttributes<HTMLDivElement> = $props();
</script>

<label
  class="tab z-10 gap-2 items-center justify-start !shadow-none rounded-b-none"
>
  <input type="radio" name="tabs" checked={tab.checked} />
  {#if trigger}
    {@render trigger?.()}
  {:else}
    <span class="{tab.icon} size-5"></span>
    {tab.label || tab.id}
  {/if}
</label>

<div
  {...rest}
  class="tab-content bg-base-100 border-none p-4 absolute top-11 left-1 !h-fit !min-h-[calc(100%-3.125rem)] !w-[calc(100%-0.625rem)] {rest.class}"
>
  {@render children?.()}
</div>
