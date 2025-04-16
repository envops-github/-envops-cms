import { DataCenter } from "@envops-cms/model";
import { VCloudDataCenterApiData } from "./api";
import { MachineData, Version } from "../machines";
import { K8s } from "../k8s/index";
import ipaddr from 'ipaddr.js';


export function scanToModel(
    scannedData: { apiData: VCloudDataCenterApiData, machinesData: MachineData[], k8s: K8s },
    srcModel: DataCenter<"vCloud">
): DataCenter<"vCloud"> {

    return {
        apiUrl: srcModel.apiUrl,
        apiUsername: srcModel.apiUsername,
        apiVersion: srcModel.apiVersion,
        name: srcModel.name,
        vdcName: srcModel.vdcName,
        org: srcModel.org,
        providerName: srcModel.providerName,
        storagePolicies: scannedData.apiData.storage?.map((s) => ({
            name: s.name,
            limitGb: Math.round(s.limit / 1024),
            usedGb: Math.round(s.storageUsedMB / 1024),
            default: s.default
        })),
        networks: scannedData.apiData.networks?.map(n => ({
                name: n.name,
                ipv4Cidr: `${n.configuration.ipScopes.ipScope[0].gateway}/${n.configuration.ipScopes.ipScope[0].subnetPrefixLength}`,
                ipv6Cidr: n.configuration.ipScopes.ipScope[1] ? `${(ipaddr.parse(n.configuration.ipScopes.ipScope[1].gateway)).toNormalizedString()}/${n.configuration.ipScopes.ipScope[1]?.subnetPrefixLength}` : '',
            })
            ),
        vApps: scannedData.apiData.vApps?.map((v) => ({
            name: v.name,
            vms: v.children?.vm.map((c) => {

                const vm = srcModel.vApps.find(vapp => vapp.name == v.name)?.vms.find(vm => vm.hostname == c.name);

                return {
                    hostname: c.name,
                    osType: c.section[0].osType,
                    hardwareVersion: c.section[0].hardwareVersion.content,
                    vmToolsVersion: c.section[0].vmToolsVersion,
                    cpuCores: c.section[0].numCpus,
                    memoryGb: Math.round(c.section[0].memoryResourceMb.configured / 1024),
                    nics: c.section[3].networkConnection?.map((n) => ({
                        name: n.network,
                        mac: n.macAddress,
                        ipv4Address: n.ipType == "IPV_4" ? n.ipAddress : "",
                        ipv6Address: n.ipType == "IPV_6" ? n.ipAddress : "",
                        ipType: n.ipType,
                        adapterType: n.networkAdapterType,
                        connectionIndex: n.networkConnectionIndex
                    })),
                    disks: c.section[0].diskSection.diskSettings?.map((d) => ({
                        storageProfile: d.storageProfile.name,
                        sizeGb: Math.round(d.sizeMb / 1024),
                        busNumber: d.busNumber
                    })),
                    versions: vm ? scannedData.machinesData.find(m => m.id == vm.id)?.versions.map(v => ({
                        name: v.name,
                        command: v.command,
                        version: v.foundVersion || ''
                    })) || [] : []
                }
            }),
            versions: srcModel.vApps.find(vapp => vapp.name == v.name)?.versions || []
        })),
        k8s: srcModel.k8s ? {
            deployments: (scannedData.k8s.deployments.data || []).map((d) => ({ name: d.name, pods: d.pods })),
            statefulSets: (scannedData.k8s.statefulSets.data || []).map((d) => ({ name: d.name, pods: d.pods })),
            namespace: srcModel.k8s?.namespace,
            sshCreds: {
                host: srcModel.k8s?.sshCreds.host,
                password: srcModel.k8s?.sshCreds.password,
                port: srcModel.k8s?.sshCreds.port,
                privateKey: srcModel.k8s?.sshCreds.privateKey,
                username: srcModel.k8s?.sshCreds.username
            }
        } : undefined

    }
}