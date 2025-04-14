import { EnvironmentModel, ModelMetadata, VCenter, VCloud } from "@envops-cms/model";
import { compare } from "@envops-cms/utils";
import { EnvopsCmsClient } from "..";
import path from "node:path";
import { generateHtml } from "@envops-cms/html-report";


export type CompareModelsControllerOptions = {
    html?:
    boolean |
    {
        open?: boolean,
        outputDir?: string
    }
}

export async function compareModelsController(
    client: EnvopsCmsClient,
    source: EnvironmentModel & { modelMetadata: ModelMetadata },
    target: EnvironmentModel & { modelMetadata: ModelMetadata },
    options?: CompareModelsControllerOptions
) {
    const comparison = compareModels(source, target);

    const comparisonReport = {
        comparison, metadata: { source: source.modelMetadata, target: target.modelMetadata }
    }

    if (!options?.html) {
        return comparisonReport;
    }

    let outputDir = `${client.options.dataDir}/output/comparison::${new Date().toISOString()}/html`;

    let openBrowser = false;
    if (typeof options.html !== 'boolean') {
        if (options?.html?.outputDir && !path.isAbsolute(options.html.outputDir)) {
            outputDir = path.join(process.cwd(), options.html.outputDir)
        }
        openBrowser = !!options.html.open;
    }



    await generateHtml({
        outputDir,
        open: openBrowser,
        data: {
            comparisonReport
        }
    });

    return comparisonReport;
}

function compareModels(
    source: EnvironmentModel,
    target: EnvironmentModel,
) {

    let modifiedSource = {
        ...source, dataCenters: source.dataCenters.map((dataCenter) => {

            if (VCloud.isDataCenter(dataCenter)) {

                return {
                    ...dataCenter, vApps: dataCenter.vApps.map((vApp) =>
                    ({
                        ...vApp, vms: vApp.vms.map((vm) =>
                            ({ ...vm, versions: [...(vm.versions ?? []), ...(vApp.versions ?? [])] })

                        )
                    }))
                }
            }

            if (dataCenter.k8s) {
                return {
                    ...dataCenter, k8s: {
                        deployments: dataCenter.k8s.deployments.map((deployment) =>
                        ({
                            ...deployment, pods: deployment.pods.map((pod) =>
                                ({ ...pod, versions: [...(pod.versions ?? []), ...(deployment.versions ?? [])] })

                            )
                        })),
                        statefulSets: dataCenter.k8s.statefulSets.map((statefulSet) =>
                        ({
                            ...statefulSet, pods: statefulSet.pods.map((pod) =>
                                ({ ...pod, versions: [...(pod.versions ?? []), ...(statefulSet.versions ?? [])] })

                            )
                        })),
                    }
                }
            }

            return dataCenter;
        })
    }

    return compare(modifiedSource, target, {
        dataCenters: {
            matcher: (src, trg) => src.name == trg.name && src.providerName == trg.providerName,
            children: {
                name: true,
                providerName: true,
                apiUrl: true,
                apiVersion: true,
                apiUsername: true,
                apiPassword: true,
                org: true,
                vdcName: true,
                vApps: {
                    matcher: (src, trg) => src.name == trg.name,
                    children: {
                        name: true,
                        vms: {
                            matcher: (src, trg) => src.hostname == trg.hostname,
                            children: {
                                hostname: true,
                                osType: true,
                                hardwareVersion: true,
                                vmToolsVersion: true,
                                cpuCores: true,
                                memoryGb: true,
                                versions: {
                                    matcher: (src, trg) => src.name == trg.name,
                                    children: {
                                        name: true,
                                        version: true
                                    }
                                },
                                nics: {
                                    matcher: (src, trg) => src.name == trg.name,
                                    children: {
                                        name: true,
                                        mac: true,
                                        ipv4Address: true,
                                        ipv6Address: true,
                                        ipType: true,
                                        adapterType: true,
                                        connectionIndex: true
                                    }
                                },
                                disks: {
                                    matcher: (src, trg) => src.sizeGb == trg.sizeGb && src.busNumber == trg.busNumber,
                                    children: {
                                        storageProfile: true,
                                        sizeGb: true,
                                        busNumber: true,
                                    }
                                },

                            }
                        }
                    }
                },
                storagePolicies: {
                    matcher: (src, trg) => src.name == trg.name,
                    children: {
                        name: true,
                        limitGb: true,
                        usedGb: true,
                        default: true,

                    }
                },
                networks: {
                    matcher: (src, trg) => src.name == trg.name,
                    children: {
                        name: true,
                        rangeIpv4: true,
                        rangeIpv6: true,
                    }
                },
                k8s: {
                    children: {
                        namespace: true,
                        deployments: {
                            matcher: (src, trg) => src.name == trg.name,
                            children: {
                                name: true,
                                pods: {
                                    matcher: (src, trg) => src.name == trg.name,
                                    children: {
                                        name: true,
                                        versions: {
                                            matcher: (src, trg) => src.name == trg.name,
                                            children: {
                                                name: true,
                                                version: true
                                            }
                                        },
                                    }
                                },
                                versions: {
                                    matcher: (src, trg) => src.name == trg.name,
                                    children: {
                                        name: true,
                                        version: true
                                    }
                                },
                            }
                        },
                        statefulSets: {
                            matcher: (src, trg) => src.name == trg.name,
                            children: {
                                name: true,
                                pods: {
                                    matcher: (src, trg) => src.name == trg.name,
                                    children: {
                                        name: true,
                                        versions: {
                                            matcher: (src, trg) => src.name == trg.name,
                                            children: {
                                                name: true,
                                                version: true
                                            }
                                        },
                                    }
                                },
                                versions: {
                                    matcher: (src, trg) => src.name == trg.name,
                                    children: {
                                        name: true,
                                        version: true
                                    }
                                },
                            }
                        }
                    }
                },
                machines: {
                    matcher: (src, trg) => src.hostname == trg.hostname,
                    children: {
                        hostname: true,
                        osName: true,
                        osVersion: true,
                        cpuCores: true,
                        memoryGb: true,
                        versions: {
                            matcher: (src, trg) => src.name == trg.name,
                            children: {
                                name: true,
                                version: true
                            }
                        },
                        nics: {
                            matcher: (src, trg) => src.name == trg.name,
                            children: {
                                name: true,
                                mac: true,
                                ipv4Address: true,
                                ipv6Address: true,
                                ipv4subnet: true,
                                ipv6subnet: true,
                            }
                        },
                        disks: {
                            matcher: (src, trg) => src.sizeGb == trg.sizeGb,
                            children: {
                                sizeGb: true,
                                name: true,
                            }
                        }
                    }
                }
            }
        }
    })
}