import type {
    DataCenter,
    Deployment,
    Pod,
    StatefulSet,
    VCloud,
} from "@envops-cms/model";
import {
    valueFromComparison,
    type Comparison,
    type PrimitiveComparison,
} from "@envops-cms/utils";
import { createChildNodes, createNode } from "..";
import { filter } from "../../report-tree-view.svelte";
import { statusIcon } from "../../../report-view.svelte";

export function createVCloudDataCenterNode(
    dcInput: DataCenter<"vCloud"> | Comparison<DataCenter<"vCloud">>
) {
    const dc = dcInput;
    const isComparison = typeof dc.name !== "string";

    const dcComparison = dc as Comparison<DataCenter<"vCloud">>;

    const inheritDcStatus =
        isComparison &&
        (dcComparison.status === "added" || dcComparison.status === "removed");

    // Create the main Data Center node
    const dcNode = createNode({
        label: isComparison
            ? valueFromComparison(dc.name as PrimitiveComparison)
            : dc.name,
        data: { ...dc, type: "vcloud.dc" },
        filter,
        icons: isComparison
            ? [statusIcon(dcComparison.status), "carbon--data-center"]
            : ["carbon--data-center"],
        children: [],
        open: false,
    });

    // --- Create primary child nodes: Networks, Storage, vApps, and Kubernetes ---
    const [
        dcNetworksNode,
        dcStorageNode,
        dcVAppsNode,
    ] = createChildNodes(
        dcNode,
        // Networks Node configuration
        {
            label: "Networks",
            open: false,
            data: { ...dc, type: "vcloud.dc.networks" },
            icons: isComparison
                ? [
                    "", // Placeholder for potential future use
                    inheritDcStatus
                        ? statusIcon(dcComparison.status) // Inherit status if DC added/removed
                        : statusIcon(
                            // Otherwise, calculate based on network changes
                            dcComparison.networks?.some(
                                (n) => n.status !== "unchanged"
                            )
                                ? "changed"
                                : "unchanged"
                        ),
                    "icon-park-outline--network-tree",
                ]
                : ["", "icon-park-outline--network-tree"], // Icons for non-comparison view
            filter,
        },
        // Storage Node configuration
        {
            label: "Storage",
            open: false,
            data: { ...dc, type: "vcloud.dc.storage" },
            icons: isComparison
                ? [
                    "",
                    inheritDcStatus
                        ? statusIcon(dcComparison.status) // Inherit status
                        : statusIcon(
                            // Calculate based on storage policy changes
                            dcComparison.storagePolicies?.some(
                                (s) => s.status !== "unchanged"
                            )
                                ? "changed"
                                : "unchanged"
                        ),
                    "material-symbols--storage",
                ]
                : ["", "material-symbols--storage"],
            filter,
        },
        // vApps Node configuration
        {
            label: "vApps",
            open: false,
            data: { ...dc, type: "vcloud.dc.vapps" },
            icons: isComparison
                ? [
                    inheritDcStatus
                        ? statusIcon(dcComparison.status) // Inherit status
                        : statusIcon(
                            // Calculate based on vApp changes
                            dcComparison.vApps?.some(
                                (v) => v.status !== "unchanged"
                            )
                                ? "changed"
                                : "unchanged"
                        ),
                    "tdesign--app",
                ]
                : ["tdesign--app"],
            children: [], // vApp children (VMs) are added later
            filter,
        },

    );

    let dcKubernetesNode;

    if (dcNode.data.k8s) {
        dcKubernetesNode = createChildNodes(
            dcNode,
            // *** NEW: Kubernetes Node configuration ***
            {
                label: "K8S",
                open: false,
                // Add kubernetes data, ensure 'type' is unique
                data: { ...dc, type: "k8s" },
                icons: isComparison
                    ? [
                        inheritDcStatus
                            ? statusIcon(dcComparison.status) // Inherit status
                            : statusIcon(
                                // Calculate based on k8s resource changes (deployments or statefulsets)
                                dcComparison.k8s?.deployments?.some(
                                    (d) => d.status !== "unchanged"
                                )
                                    ||
                                    dcComparison.k8s?.statefulSets?.some(
                                        (s) => (s).status !== "unchanged"
                                    )
                                    ? "changed"
                                    : "unchanged"
                            ),
                        "mdi--kubernetes ", // K8s icon
                    ]
                    : ["mdi--kubernetes "], // K8s icon for non-comparison
                children: [], // K8s children (deployments, statefulsets) added below
                filter,
            })[0];
    }

    // --- Populate vApps Children (VMs) ---
    // Check if vApps exist before mapping
    const vAppNodes = createChildNodes(
        dcVAppsNode,
        ...(dc.vApps as Array<VCloud.vApp | Comparison<VCloud.vApp>>).map(
            (vapp) => {
                const vappComparison = vapp as Comparison<VCloud.vApp>;
                return {
                    data: { ...vapp, type: "vcloud.dc.vapp" },
                    label: isComparison
                        ? valueFromComparison(vapp.name as PrimitiveComparison)
                        : vapp.name,
                    open: false,
                    filter,
                    icons: isComparison
                        ? [
                            inheritDcStatus
                                ? statusIcon(dcComparison.status) // Inherit DC status
                                : statusIcon(vappComparison.status), // Use vApp's own status
                            "clarity--vmw-app-line",
                        ]
                        : ["clarity--vmw-app-line"],
                };
            }
        )
    );

    // Populate VM nodes for each vApp node
    vAppNodes.forEach((vappNode) => {
        const vapp = vappNode.data as VCloud.vApp | Comparison<VCloud.vApp>;
        const vappComparison = vapp as Comparison<VCloud.vApp>;

        const [vmsNode] = createChildNodes(
            vappNode,
            // VMs Node configuration within a vApp
            {
                label: "VMs",
                data: { ...vapp, type: "vcloud.dc.vapps.vms" }, // Adjusted type
                open: false,
                filter,
                children: [],
                icons: isComparison
                    ? [
                        inheritDcStatus
                            ? statusIcon(dcComparison.status) // Inherit DC status
                            : statusIcon(
                                // Calculate based on VM changes within this vApp
                                vappComparison.vms?.some(
                                    (vm) =>
                                        (vm).status !==
                                        "unchanged"
                                )
                                    ? "changed"
                                    : "unchanged"
                            ),
                        "ix--screens", // VMs collection icon
                    ]
                    : ["ix--screens"],
            }
        );

        // Create individual VM nodes
        createChildNodes(
            vmsNode,
            ...(vapp.vms as Array<VCloud.vm | Comparison<VCloud.vm>>).map(
                (vm) => {
                    const vmComparison = vm as Comparison<VCloud.vm>;
                    return {
                        data: { ...vm, type: "vcloud.dc.vapps.vm" }, // Adjusted type
                        label: isComparison
                            ? valueFromComparison(
                                vm.hostname as PrimitiveComparison
                            )
                            : vm.hostname,
                        open: false,
                        filter,
                        icons: isComparison
                            ? [
                                inheritDcStatus
                                    ? statusIcon(dcComparison.status) // Inherit DC status
                                    : statusIcon(vmComparison.status), // Use VM's own status
                                "codicon--vm", // Individual VM icon
                            ]
                            : ["codicon--vm"],
                    };
                }
            )
        );

    });


    if (dcKubernetesNode) {
        //Populate Kubernetes Children (Deployments and StatefulSets) *** ---

        // --- Create Grouping Nodes for Deployments and StatefulSets ---
        const [
            deploymentsGroupNode,
            statefulSetsGroupNode
        ] = createChildNodes(
            dcKubernetesNode, // Parent is the main K8S node
            // 1. Deployments Group Node
            {
                label: "Deployments",
                open: false,
                // Data could be a subset or reference, adjust as needed
                data: { ...dc, type: "k8s.deployments" },
                icons: isComparison
                    ? [
                        inheritDcStatus
                            ? statusIcon(dcComparison.status)
                            : statusIcon(
                                // Status depends on children changing
                                dcComparison.k8s?.deployments?.some(
                                    (d) => (d).status !== "unchanged"
                                )
                                    ? "changed"
                                    : "unchanged"
                            ),
                        "ant-design--deployment-unit-outlined", // Icon for the Deployments group
                    ]
                    : ["ant-design--deployment-unit-outlined"],
                filter,
                children: [], // Individual deployments added below
            },
            // 2. StatefulSets Group Node
            {
                label: "Stateful Sets",
                open: false,
                // Data could be a subset or reference, adjust as needed
                data: { ...dc, type: "k8s.statefulsets" },
                icons: isComparison
                    ? [
                        inheritDcStatus
                            ? statusIcon(dcComparison.status)
                            : statusIcon(
                                // Status depends on children changing
                                dcComparison.k8s?.statefulSets?.some(
                                    (s) => (s).status !== "unchanged"
                                )
                                    ? "changed"
                                    : "unchanged"
                            ),
                        "eos-icons--stateful-set-outlined", // Icon for the StatefulSets group (example)
                    ]
                    : ["eos-icons--stateful-set-outlined"],
                filter,
                children: [], // Individual statefulsets added below
            }
        );

        // --- Populate Deployments Group Node ---
        const deploymmentNodes = createChildNodes(
            deploymentsGroupNode, // Parent is the "Deployments" group node
            ...(dc.k8s?.deployments || []).map((deployment) => {

                // Assuming 'name' exists on deployment object/comparison
                const deploymentName = isComparison
                    ? valueFromComparison(deployment.name as PrimitiveComparison)
                    : deployment.name;

                return {
                    label: deploymentName,
                    // Unique type for individual deployment
                    data: { ...deployment, type: "k8s.deployment" },
                    open: false,
                    filter,
                    icons: isComparison
                        ? [
                            inheritDcStatus
                                ? statusIcon(dcComparison.status) // Inherit DC status
                                : statusIcon((deployment as PrimitiveComparison).status), // Use deployment's status
                            "ant-design--deployment-unit-outlined", // Icon for individual deployment
                        ]
                        : ["ant-design--deployment-unit-outlined"],
                    children: []
                };
            })
        );

        deploymmentNodes.forEach((depNode) => {
            const deployment = depNode.data as Deployment;

            // Create individual VM nodes
            createChildNodes(
                depNode,
                ...deployment.pods.map(
                    (pod) => {
                        //@ts-expect-error
                        const podComparison = pod as Comparison<Pod>;
                        return {
                            data: { ...pod, type: "k8s.pod" }, // Adjusted type
                            label: isComparison
                                ? valueFromComparison(
                                    podComparison.name
                                )
                                : pod.name,
                            open: false,
                            filter,
                            icons: isComparison
                                ? [
                                    inheritDcStatus
                                        ? statusIcon(dcComparison.status) // Inherit DC status
                                        : statusIcon(podComparison.status), // Use VM's own status
                                    "clarity--pod-line", // Individual VM icon
                                ]
                                : ["clarity--pod-line"],
                        };
                    }
                )
            );

        });

        // --- Populate StatefulSets Group Node ---
        const statefulSetsNodes = createChildNodes(
            statefulSetsGroupNode, // Parent is the "StatefulSets" group node
            ...(dc.k8s?.statefulSets || []).map((statefulSet) => {

                // Assuming 'name' exists on statefulset object/comparison
                const statefulSetName = isComparison
                    ? valueFromComparison(
                        statefulSet.name as PrimitiveComparison
                    )
                    : statefulSet.name;

                return {
                    label: statefulSetName,
                    // Unique type for individual statefulset
                    data: { ...statefulSet, type: "k8s.statefulset" },
                    open: false,
                    filter,
                    icons: isComparison
                        ? [
                            inheritDcStatus
                                ? statusIcon(dcComparison.status) // Inherit DC status
                                : statusIcon((statefulSet as PrimitiveComparison).status), // Use statefulset's status
                            "eos-icons--stateful-set-outlined", // Icon for individual statefulset (example)
                        ]
                        : ["eos-icons--stateful-set-outlined"],
                    children: []
                };
            })
        );

        statefulSetsNodes.forEach((setNode) => {
            const set = setNode.data as StatefulSet;

            // Create individual VM nodes
            createChildNodes(
                setNode,
                ...set.pods.map(
                    (pod) => {
                        //@ts-expect-error
                        const podComparison = pod as Comparison<Pod>;
                        return {
                            data: { ...pod, type: "k8s.pod" }, // Adjusted type
                            label: isComparison
                                ? valueFromComparison(
                                    podComparison.name
                                )
                                : pod.name,
                            open: false,
                            filter,
                            icons: isComparison
                                ? [
                                    inheritDcStatus
                                        ? statusIcon(dcComparison.status) // Inherit DC status
                                        : statusIcon(podComparison.status), // Use VM's own status
                                    "clarity--pod-line", // Individual VM icon
                                ]
                                : ["clarity--pod-line"],
                        };
                    }
                )
            );

        });
    }

    return dcNode;
}