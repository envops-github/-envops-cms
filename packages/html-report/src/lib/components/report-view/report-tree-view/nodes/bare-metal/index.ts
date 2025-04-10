import type {
    BareMetal,
    DataCenter,
} from "@envops-cms/model";
import {
    valueFromComparison,
    type Comparison,
    type PrimitiveComparison,
} from "@envops-cms/utils";
import { createChildNodes, createNode } from "..";
import { filter } from "../../report-tree-view.svelte";
import { statusIcon } from "../../../report-view.svelte";

export function createBareMetalDataCenterNode(
    dcInput: DataCenter<"BareMetal"> | Comparison<DataCenter<"BareMetal">>
) {
    const dc = dcInput;
    const isComparison = typeof dc.name !== "string";

    const dcComparison = dc as Comparison<DataCenter<"BareMetal">>;

    const inheritDcStatus =
        isComparison &&
        (dcComparison.status === "added" || dcComparison.status === "removed");

    // Create the main Data Center node
    const dcNode = createNode({
        label: isComparison
            ? valueFromComparison(dc.name as PrimitiveComparison)
            : dc.name,
        data: { ...dc, type: "baremetal.dc" },
        filter,
        icons: isComparison
            ? [statusIcon(dcComparison.status), "carbon--data-center"]
            : ["carbon--data-center"],
        children: [],
        open: false,
    });

    const [
        machinesNode,
    ] = createChildNodes(
        dcNode,
        {
            label: "Machines",
            open: false,
            data: { ...dc, type: "baremetal.dc.machines" },
            icons: isComparison
                ? [
                    inheritDcStatus
                        ? statusIcon(dcComparison.status) // Inherit status
                        : statusIcon(
                            dcComparison.machines?.some(
                                (v) => v.status !== "unchanged"
                            )
                                ? "changed"
                                : "unchanged"
                        ),
                    "ix--screens",
                ]
                : ["ix--screens"],
            children: [],
            filter,
        },
    );

     const machineNodes = createChildNodes(
            machinesNode,
            ...(dc.machines as Array<BareMetal.Machine | Comparison<BareMetal.Machine>>).map(
                (machine) => {
                    const machineComparison = machine as Comparison<BareMetal.Machine>;
                    return {
                        data: { ...machine, type: "baremetal.dc.machine" },
                        label: isComparison
                            ? valueFromComparison(machine.hostname as PrimitiveComparison)
                            : machine.hostname,
                        open: false,
                        filter,
                        icons: isComparison
                            ? [
                                inheritDcStatus
                                    ? statusIcon(dcComparison.status) // Inherit DC status
                                    : statusIcon(machineComparison.status), // Use vApp's own status
                                "codicon--vm",
                            ]
                            : ["codicon--vm"],
                    };
                }
            )
        );

    return dcNode;
}