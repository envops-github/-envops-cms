import { SSHCredentials } from "./environment-model"

export type DataCenter = {
    name: string,
    providerName: 'BareMetal',
    machines: Machine[],
    versions?: {
        name: string,
        command: string,
        version: string
    }[]
}

export type Machine = {
    id?: string,
    sshCreds: SSHCredentials;
    hostname: string,
    osName: string,
    osVersion: string,
    cpuCores: number,
    memoryGb: number,
    nics: NIC[],
    disks: Disk[],
    versions?: {
        name: string,
        command: string,
        version: string
    }[]
}

export type NIC = {
    name: string,
    mac: string,
    ipv4Address: string | null,
    ipv6Address: string | null,
    ipv4subnet: string | null,
    ipv6subnet: string | null,
}

export type Disk = {
    sizeGb: number,
    name: string,
}


export function isDataCenter(dc: any): dc is DataCenter {
    const { name, providerName, machines, versions, ...rest } = <DataCenter>dc;
    return typeof name == 'string'
        && typeof providerName == 'string'
        && !Object.keys(rest).length
}