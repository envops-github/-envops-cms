<script lang="ts">
  let {
    name,
    type,
    icon,
    badge,
  }: {
    name: string;
    type: string;
    icon: string;
    badge?: { label: string; class?: string };
  } = $props();
</script>

<div
  class="sticky top-0 left-0 z-20 w-full flex p-2 gap-2 bg-base-200 items-center border-b border-base-content/10"
>
  <span class="{icon} size-10"></span>
  <div>
    <div class="flex gap-2 items-center">
      <p class="text-sm">{type}</p>
      {#if badge}
        <p class="text-sm badge badge-primary {badge.class}">{badge.label}</p>
      {/if}
    </div>
    <p class="font-semibold">{name}</p>
  </div>
</div>
