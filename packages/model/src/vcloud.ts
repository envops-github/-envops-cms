import { SSHCredentials } from "./environment-model"


export type DataCenter = {
    name: string,
    providerName: 'vCloud',
    apiUrl: string,
    apiVersion: string,
    apiUsername: string,
    apiPassword?: string,
    apiToken?: string,
    org: string,
    vdcName: string,
    vApps: vApp[],
    networks: Network[],
    storagePolicies: StoragePolicy[],
}

export type StoragePolicy = {
    name: string,
    limitGb: number,
    usedGb: number,
    default: boolean,
}

export type Network = {
    name: string,
    ipv4Cidr: string,
    ipv6Cidr: string,
}

export type vApp = {
    name: string,
    vms: vm[],
    //dcNetworks: string[],
    //networks: Network[],
    sshCreds?: SSHCredentials,
    versions?: {
        name: string,
        command: string,
        version: string
    }[]
    // containers: {}[]
}

export type vm = {
    id?: string,
    hostname: string,
    osType: string,
    hardwareVersion: string,
    vmToolsVersion: string,
    cpuCores: number,
    //cpuSpeedGhz: number,
    memoryGb: number,
    nics: NIC[],
    disks: Disk[],
    sshCreds?: SSHCredentials,
    versions: {
        name: string,
        command: string,
        version: string
    }[]
}

export type NIC = {
    name: string,
    mac: string,
    ipv4Address: string,
    ipv6Address: string,
    ipType: "IPV_4" | "IPV_6" //TODO
    adapterType: string,
    connectionIndex: number
}

export type Disk = {
    storageProfile: string
    sizeGb: number,
    busNumber: number,
    //unitNumber: number
}

export function isDataCenter(dc: any): dc is DataCenter {
    //@ts-expect-error for sshCreds and k8s TODO fix this
    const { name, providerName, apiUrl, storagePolicies, apiVersion, org, apiUsername, apiPassword, apiToken, vApps, vdcName, networks, sshCreds, k8s, ...rest } = <DataCenter>dc;
    return typeof name == 'string'
        && typeof providerName == 'string'
        && typeof apiUrl == 'string'
        && typeof apiVersion == 'string'
        && typeof org == 'string'
        && (typeof apiPassword == 'string' || apiPassword === undefined)
        && (typeof apiToken == 'string' || apiToken === undefined)
        && typeof apiUsername == 'string'
        && typeof vdcName == 'string'
        && Array.isArray(vApps)
        && !vApps.some(vapp => !isVApp(vapp))
        && Array.isArray(networks)
        && !networks.some(net => !isNetwork(net))
        && Array.isArray(storagePolicies)
        && !Object.keys(rest).length
}

export function isNetwork(net: any): net is Network {
    const { name, ipv4Cidr, ipv6Cidr, ...rest } = <Network>net;
    return typeof name == 'string'
        && typeof ipv4Cidr == 'string'
        && typeof ipv6Cidr == 'string'
        && !Object.keys(rest).length
}

export function isVApp(vapp: any): vapp is vApp {
    const { name, vms, versions, sshCreds, ...rest } = <vApp>vapp;
    return typeof name == 'string'
        && Array.isArray(vms)
        //&& Array.isArray(networks)
        //&& Array.isArray(dcNetworks)
        && !vms.some(vm => !isVm(vm))
        && !Object.keys(rest).length
}

export function isVm(vm: any): vm is vm {
    const { hostname, cpuCores, osType, hardwareVersion, vmToolsVersion, memoryGb, nics, disks, versions, sshCreds, id, ...rest } = <vm>vm;
    return typeof hostname == 'string'
        && typeof osType == 'string'
        && typeof hardwareVersion == 'string'
        && typeof vmToolsVersion == 'string'
        && typeof cpuCores == 'number'
        //&& typeof cpuSpeedGhz == 'number'
        && typeof memoryGb == 'number'
        && Array.isArray(nics)
        && Array.isArray(disks)
        && !Object.keys(rest).length
}
