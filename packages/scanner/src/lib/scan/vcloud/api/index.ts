import { DataCenter } from "@envops-cms/model";
import { getVdc, Vdc } from "./vdc";
import { getToken, fetchVCloudApi, extractPathname } from "./fetch";


export type vCloudRecord = {
    name: string;
    id: string;
    href: string
}

export type VdcStorage = {
    name: string;
    limit: number;
    storageUsedMB: number;
    default: boolean;
    enabled: boolean;
}

export type VdcNetworks = {
    name: string;
    configuration: {
        ipScopes: {
            ipScope: {
                gateway: string;
                netmask: string
            }[]
        }
    }
}

export type VdcVApps = {
    name: string;
    children: { vm: VdcVM[] }
}

export type VdcVM = {
    id: string;
    name: string;
    section: VMSection
}

export type VMSection = [
    {
        osType: string;
        numCpus: number;
        memoryResourceMb: { configured: number }
        hardwareVersion: { content: string };
        vmToolsVersion: string;
        cpuResourceMhz: { configured: number },
        diskSection: {
            diskSettings: {
                sizeMb: number;
                unitNumber: number;
                busNumber: number;
                storageProfile: { name: string }
            }[]
        };
    },
    {},
    {},
    {
        networkConnection: {
            network: string;
            networkConnectionIndex: number;
            ipAddress: string;
            ipType: "IPV_4" | "IPV_6"
            macAddress: string;
            networkAdapterType: string
        }[]

    }
];

export type VCloudDataCenterApiData = {
    vdc: Vdc;
    vApps: VdcVApps[];
    storage: VdcStorage[];
    networks: VdcNetworks[];
}


export async function scanVCloudApi(dataCenter: DataCenter<"vCloud">) {

    let baseUrl: URL;

    try {
        baseUrl = new URL(dataCenter.apiUrl);

        if (!['http:', 'https:'].includes(baseUrl.protocol)) {
            throw new Error("protocol");
        }

    } catch (error) {
        throw new Error(error instanceof Error && error.message == "protocol" ? `Invalid url protocol, expects: http or https, Datacenter: ${dataCenter.name}` : `Invalid url: ${dataCenter.apiUrl}, Datacenter: ${dataCenter.name}`);
    }

    if (!dataCenter.apiToken) {
        dataCenter.apiToken = await getToken(dataCenter);
    }

    const vdc = await getVdc(dataCenter);

    const [vApps, networks, storage] = await Promise.all([
        getvApps(vdc, dataCenter),
        getNetworks(vdc, dataCenter),
        getStorage(vdc, dataCenter)
    ]);

    return {
        vdc, vApps, networks, storage
    } as VCloudDataCenterApiData;
}


export async function getStorage(vdc: Vdc, dataCenter: DataCenter<"vCloud">) {

    let storages = [];

    const storageLinks = vdc.vdcStorageProfiles.vdcStorageProfile.map((d) => d.href);

    for (let i = 0; i < storageLinks.length; i++) {
        const storagePath = extractPathname(storageLinks[i]);

        const response = await fetchVCloudApi(storagePath, dataCenter);

        if (!response.ok) {
            throw new Error(`Failed to fetch storage profile for ID ${storagePath}: ${response.statusText}`);
        }

        storages.push(await response.json());
    }

    return storages as VdcStorage[];

}

export async function getNetworks(vdcData: Vdc, dataCenter: DataCenter<"vCloud">) {

    let networks = [];

    const networkLinks = vdcData.availableNetworks.network.map((d) => d.href);

    for (let i = 0; i < networkLinks.length; i++) {
        const networkPath = extractPathname(networkLinks[i]);

        const response = await fetchVCloudApi(networkPath, dataCenter);

        if (!response.ok) {
            throw new Error(`Failed to fetch network for ID ${networkPath}: ${response.statusText}`);
        }

        networks.push(await response.json());
    }

    return networks as VdcNetworks[];


}

export async function getvApps(vdc: Vdc, dataCenter: DataCenter<"vCloud">) {

    let vApps = [];

    const vAppLinks = vdc.resourceEntities.resourceEntity.filter((resourse) => resourse.href.includes("/vApp/")).map(d => d.href);

    for (let i = 0; i < vAppLinks.length; i++) {
        const vAppPath = extractPathname(vAppLinks[i]);

        const response = await fetchVCloudApi(vAppPath, dataCenter);

        if (!response.ok) {
            throw new Error(`Failed to fetch vApp for ID ${vAppPath}: ${response.statusText}`);
        }

        vApps.push(await response.json());

    }

    return vApps as VdcVApps[];
}
