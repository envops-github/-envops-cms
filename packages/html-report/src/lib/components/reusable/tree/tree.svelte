<script lang="ts" module>
  import type { MaybePromise } from "@envops-cms/utils";
  import type { Snippet } from "svelte";
  import TreeNodeView from "./tree-node.svelte";

  export type Tree = TreeNode[];

  export type TreeNode<NodeData = any> = {
    id: string;
    data: NodeData;
    label: string;
    icons?: string[];
    open: boolean;
    parent?: TreeNode;
    snippet?: Snippet<[TreeNode<NodeData>]>;
    children?: TreeNode[];
    onclick?: (node: TreeNode<NodeData>) => MaybePromise;
    filter?: (node: TreeNode<NodeData>, filterValue: string) => boolean;
  };
</script>

<script lang="ts">
  let {
    tree = $bindable(),
    selected = $bindable(undefined),
    filterValue,
    onselect,
  }: {
    tree: TreeNode[];
    selected?: TreeNode;
    filterValue?: string;
    onselect?: (node: TreeNode) => MaybePromise;
  } = $props();
</script>

<div class="flex w-full h-full min-w-fit flex-col">
  {#each tree as node, i (node.id)}
    <TreeNodeView {filterValue} {onselect} bind:node={tree[i]} bind:selected />
  {/each}
</div>
