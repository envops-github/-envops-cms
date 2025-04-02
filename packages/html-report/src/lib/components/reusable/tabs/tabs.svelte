<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  let {
    children,
    ...rest
  }: { children?: Snippet<[]> } & HTMLAttributes<HTMLDivElement> = $props();
</script>

<div {...rest} class="relative flex-nowrap tabs tabs-box h-full {rest.class}">
  {@render children?.()}
</div>
