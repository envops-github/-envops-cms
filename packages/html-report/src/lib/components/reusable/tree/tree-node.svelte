<script lang="ts" generics="NodeData">
  import type { TreeNode } from "./tree.svelte";
  import TreeNodeView from "./tree-node.svelte";
  import type { MaybePromise } from "@envops-cms/utils";

  let {
    node = $bindable(),
    step = 0,
    selected = $bindable(undefined),
    onselect,
    filterValue,
  }: {
    node: TreeNode<NodeData>;
    step?: number;
    selected?: TreeNode;
    filterValue?: string;
    onselect?: (node: TreeNode) => MaybePromise;
  } = $props();

  $effect(() => {
    if (node.filter?.(node, filterValue || "")) {
      node.open = true;
    }
  });
</script>

{#if !node.filter || node.filter?.(node, filterValue || "")}
  <button
    onclick={() => {
      selected = node;
      node.open = !node.open;
      node.onclick?.(node);
      onselect?.(node);
    }}
    class="peer h-8 w-full flex flex-nowrap items-center justify-start gap-1 px-2 duration-100 hover:bg-primary hover:text-primary-content {selected?.id ==
    node.id
      ? 'bg-primary text-primary-content	'
      : ''}"
  >
    {#each { length: step } as _}
      <div class="h-full w-5 shrink-0"></div>
    {/each}

    {#if node.children}
      {#if node.open}
        <span class="mdi--chevron-down size-5 shrink-0"></span>
      {:else}
        <span class="mdi--chevron-right size-5 shrink-0"></span>
      {/if}
    {/if}

    {#if node.snippet}
      {@render node.snippet(node)}
    {:else}
      {#if node.icons?.length}
        {#each node.icons as icon}
          <span class="{icon} size-5 shrink-0"></span>
        {/each}
      {/if}
      <p class="pl-0.5 whitespace-nowrap">{node.label}</p>
    {/if}
  </button>

  <div class="flex w-full min-w-fit flex-col">
    {#if node.children && node.open}
      {#each node.children as child, i (child.id)}
        <TreeNodeView
          {onselect}
          {filterValue}
          bind:selected
          bind:node={node.children[i]}
          step={step + 1}
        />
      {/each}
    {/if}
  </div>
{/if}
