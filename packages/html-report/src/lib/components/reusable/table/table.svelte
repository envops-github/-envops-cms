<script
    lang="ts"
    module
>
    import type { MaybePromise, ComparisonStatus } from "@envops-cms/utils";
    import { untrack, type Snippet } from "svelte";
    import { slide } from "svelte/transition";
    import { v4 } from "uuid";

    export type Row<TData = any> = {
        id: string;
        data: TData;
        open: boolean;
        i: number;
    };

    export type Column<TData = any> = {
        id: string;
        label: string;
        snippet?: Snippet<[Row<TData>]>;
        accessor?: keyof TData | ((row: Row<TData>) => any);
    };

    export type StatusMeta = {
        label: string;
        classes: {
            active: string;
            inactive: string;
        };
    };

    export type Label = "missing" | "unchanged" | "changed" | "unknown";
    export const labels: Label[] = [
        "missing",
        "unchanged",
        "changed",
        "unknown",
    ];

    export function statusToStatus(status: ComparisonStatus) {
        switch (status) {
            case "added":
                return "missing";

            case "changed":
                return "changed";

            case "unchanged":
                return "unchanged";

            case "removed":
                return "missing";
            default:
                return "unknown";
        }
    }

    export const statusMeta: Record<Label, StatusMeta> = {
        missing: {
            label: "Missing",
            classes: {
                active: "bg-red-500 text-white",
                inactive: "border border-red-500 text-red-500 bg-white",
            },
        },
        unchanged: {
            label: "Unchanged",
            classes: {
                active: "bg-green-500 text-white",
                inactive: "border border-green-500 text-green-500 bg-white",
            },
        },
        changed: {
            label: "Changed",
            classes: {
                active: "bg-yellow-500 text-white",
                inactive: "border border-yellow-500 text-yellow-500 bg-white",
            },
        },
        unknown: {
            label: "Unknown",
            classes: {
                active: "bg-purple-500 text-white",
                inactive: "border border-purple-500 text-purple-500 bg-white",
            },
        },
    };

    export function toRows<TData>(data?: TData[]): Row<TData>[] {
        return [
            ...(data || []).map((data, i) => ({
                data,
                id: v4(),
                open: false,
                i,
            })),
        ];
    }
</script>

<script
    lang="ts"
    generics="TData"
>
    let {
        data,
        columns,
        expandable,
        expandedRowContent,
        pagination,
        filter,
        empty,
        onRowClick,
        headerless,
    }: {
        data: TData[];
        columns: Column<TData>[];
        expandable?: boolean;
        pagination?: boolean;
        headerless?: boolean;
        onRowClick?: (row: Row<TData>) => MaybePromise;
        filter?: (filterValue: string, row: Row<TData>) => boolean;
        expandedRowContent?: Snippet<[Row<TData>]>;
        empty?: Snippet<[]>;
    } = $props();

    let currentPage = $state(0);

    let itemsPerPage = $state(10);

    let filterValue = $state("");

    let rows: Row[] = $state([]);
    let filteredRows: Row[] = $derived.by(() => {
        return rows.filter(
            row =>
                !statusExcluded[statusToStatus(row.data.status)] &&
                (!filterValue || filter?.(filterValue, row))
        );
    });
    let displayedRows: Row[] = $derived.by(() => {
        const start = currentPage * itemsPerPage;
        return filteredRows.slice(start, start + itemsPerPage);
    });

    let statusExcluded: Record<Label, boolean> = $state({
        missing: false,
        unchanged: false,
        changed: false,
        unknown: false,
    });

    $effect(() => {
        rows = toRows(data);
    });

    let statusCounts: Record<Label, number> = $derived.by(() => {
        let statusCounts = {
            missing: 0,
            unchanged: 0,
            changed: 0,
            unknown: 0,
        };

        rows.forEach(d => {
            const statusConvert = statusToStatus(
                d.data.status as ComparisonStatus
            );
            statusCounts[statusConvert]++;
        });

        return statusCounts;
    });

    $effect(() => {
        filterValue;
        rows;
        untrack(() => {
            currentPage = 0;
        });
    });

    const columnCount = $derived.by(() => {
        let count = columns.length;

        if (expandable) count += 1;

        return count;
    });

    function filterStatus(status: Label) {
        statusExcluded[status] = !statusExcluded[status];
    }
</script>

{#if filter}
    <div class="flex items-center gap-4 w-full mb-2">
        <div class="flex items-center gap-2 h-full">
            <label class="input w-md mb-2">
                <span class="size-6 text-base-content mdi--filter-outline"
                ></span>
                <input
                    bind:value={filterValue}
                    type="search"
                    class="grow"
                    placeholder="Filter"
                />
            </label>

            <div class="flex items-center gap-1 mb-2 h-full">
                <span class="text-gray-600">Status:</span>
                {#each labels as status}
                    <button
                        aria-label={statusMeta[status].label}
                        class="{statusExcluded[status]
                            ? statusMeta[status].classes.inactive
                            : statusMeta[status].classes.active} min-w-[1.5rem] text-center rounded-lg transition-colors"
                        onclick={() => filterStatus(status)}
                    >
                        {statusCounts[status]}
                    </button>
                {/each}
            </div>
        </div>
    </div>
{/if}

<div class="overflow-x-auto border rounded-md">
    <table class="table table-sm">
        {#if !headerless}
            <thead class="bg-base-200">
                <tr>
                    {#if expandable}
                        <th class="w-0 min-w-fit"></th>
                    {/if}
                    {#each columns as column}
                        <th>
                            {column.label}
                        </th>
                    {/each}
                </tr>
            </thead>
        {/if}
        <tbody>
            {#if !rows.length}
                <tr class="w-full text-sm!">
                    <td
                        colspan={columnCount}
                        class="text-gray-500"
                        >{#if empty}
                            {@render empty()}
                        {:else}
                            <p>No items</p>
                        {/if}</td
                    >
                </tr>
            {/if}
            {#each displayedRows as row (row.id)}
                <tr
                    onclick={() => onRowClick?.(row)}
                    class={onRowClick
                        ? "hover:bg-base-200 duration-200 cursor-pointer"
                        : ""}
                >
                    {#each columns as column}
                        {#if expandable}
                            <td class="w-0 min-w-fit pr-0">
                                <button
                                    onclick={() => (row.open = !row.open)}
                                    aria-label="toggle row"
                                    class="btn btn-square btn-xs btn-ghost"
                                >
                                    <span class="size-4 mingcute--down-line"
                                    ></span>
                                </button>
                            </td>
                        {/if}
                        <td>
                            {#if column.snippet}
                                {@render column.snippet(row)}
                            {:else if column.accessor}
                                {typeof column.accessor == "function"
                                    ? column.accessor(row)
                                    : row.data[column.accessor]}
                            {/if}
                        </td>
                    {/each}
                </tr>
                {#if expandable && row.open}
                    <tr>
                        <td
                            class="bg-base-200"
                            colspan={columnCount}
                        >
                            <div
                                transition:slide={{ axis: "y", duration: 200 }}
                                class="w-full"
                            >
                                {@render expandedRowContent?.(row)}
                            </div>
                        </td>
                    </tr>
                {/if}
            {/each}
        </tbody>
    </table>
    {#if pagination}
        <div class="flex items-center gap-2 p-2 text-xs border-t bg-base-200">
            <div class="join">
                <button
                    disabled={currentPage == 0}
                    onclick={() => {
                        if (currentPage > 0) currentPage -= 1;
                    }}
                    class="join-item btn btn-sm">«</button
                >
                <button class="join-item btn btn-sm"
                    >Page {currentPage + 1}</button
                >
                <button
                    disabled={currentPage + 1 >=
                        filteredRows.length / itemsPerPage}
                    onclick={() => {
                        currentPage += 1;
                    }}
                    class="join-item btn btn-sm">»</button
                >
            </div>
            <div class="grow"></div>
            <p class="text-gray-500">Items per page</p>
            <select
                bind:value={
                    () => itemsPerPage.toString(),
                    value => {
                        itemsPerPage = parseInt(value);
                        currentPage = 0;
                    }
                }
                class="select select-sm w-fit pr-8"
            >
                <option>10</option>
                <option>25</option>
                <option>50</option>
            </select>
        </div>
    {/if}
</div>
