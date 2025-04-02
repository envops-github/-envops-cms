
export type DataCenter = {
    name: string,
    providerName: 'vCenter',
    apiUrl: string,
    apiUsername: string,
    apiPassword?: string,
    apiToken?: string,
    vApps: vApp[],
    networks: DCNetwork[]
}

export type DCNetwork = {
    name: string,
    type: DCNetworkType,
    gatewayCidr: string,
}

export type DCNetworkType = 'Isolated' | 'Routed';

export type vApp = {
    name: string,
    vms: vm[]
}

export type vm = {
    hostname: string
}

export function isDataCenter(dc: any): dc is DataCenter {
    const { name, providerName, apiUrl, apiUsername, apiPassword, apiToken, vApps, networks, ...rest } = <DataCenter>dc;
    return typeof name == 'string'
        && typeof providerName == 'string'
        && typeof apiUrl == 'string'
        && (typeof apiPassword == 'string' || apiPassword === undefined)
        && (typeof apiToken == 'string' || apiToken === undefined)
        && typeof apiUsername == 'string'
        && Array.isArray(vApps)
        && !vApps.some(vapp => !isVApp(vapp))
        && Array.isArray(networks)
        && !networks.some(net => !isDCNetwork(net))
        && !Object.keys(rest).length
}

export function isDCNetwork(net: any): net is DCNetwork {
    const { name, gatewayCidr, type, ...rest } = <DCNetwork>net;
    return typeof name == 'string'
        && typeof gatewayCidr == 'string'
        && (type == 'Isolated' || type == 'Routed')
        && !Object.keys(rest).length
}

export function isVApp(vapp: any): vapp is vApp {
    const { name, vms, ...rest } = <vApp>vapp;
    return typeof name == 'string'
        && Array.isArray(vms)
        && !vms.some(vm => !isVm(vm))
        && !Object.keys(rest).length
}

export function isVm(vm: any): vm is vm {
    const { hostname, ...rest } = <vm>vm;
    return typeof hostname == 'string'
        && !Object.keys(rest).length
}
