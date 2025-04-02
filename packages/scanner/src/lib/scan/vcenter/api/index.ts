import { DataCenter } from "@envops-cms/model";
import { getToken, fetchVCenterApi, extractPathname } from "./fetch";


export type VM = {
    vm: string;
}

export type VMData = {
    name: string;
}

export type Cluster = {
    name: string;
}

export type Network = {
    name: string;
    type: string;
    network:string
}

export type VCenterDataCenterApiData = {
    cluster: Cluster[];
    vms: VMData[];
    networks: Network[];
}




export async function scanVCenterApi(dataCenter: DataCenter<"vCenter">) {

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


    return {}

}


export async function getVms(dataCenter: DataCenter<"vCenter">) {

    let vmData = [];

    const response = await fetchVCenterApi(`/vcenter/vm`, dataCenter);

    if (!response.ok) {
        throw new Error(`Failed to fetch vm list from ${dataCenter.apiUrl}: ${response.statusText}`);
    }

    const vmList = await response.json() as VM[];

    for (let i = 0; i < vmList.length; i++) {
        const vmInfo = vmList[i];

        const response = await fetchVCenterApi(`/vcenter/vm/${vmInfo.vm}`, dataCenter);

        if (!response.ok) {
            throw new Error(`Failed to fetch vm data from ${vmInfo.vm}: ${response.statusText}`);
        }

        vmData.push(await response.json());

    }

    return vmData as VMData[];

}

// {
//   value: {
//     instant_clone_frozen: false,
//     cdroms: [ [Object] ],
//     memory: {
//       hot_add_increment_size_MiB: 0,
//       size_MiB: 98304,
//       hot_add_enabled: false,
//       hot_add_limit_MiB: 98304
//     },
//     disks: [ [Object], [Object], [Object], [Object], [Object] ],
//     parallel_ports: [],
//     sata_adapters: [ [Object] ],
//     cpu: {
//       hot_remove_enabled: false,
//       count: 12,
//       hot_add_enabled: false,
//       cores_per_socket: 1
//     },
//     scsi_adapters: [ [Object] ],
//     power_state: 'POWERED_ON',
//     floppies: [],
//     identity: {
//       name: 'ts4omdb01refsc001',
//       instance_uuid: '501bc8e1-d667-5c7d-d25e-99270b4a9f78',
//       bios_uuid: '421b1f7d-1020-94e6-4eb9-897421f9611b'
//     },
//     nvme_adapters: [],
//     name: 'ts4omdb01refsc001',
//     nics: [ [Object], [Object], [Object] ],
//     boot: {
//       delay: 0,
//       retry_delay: 10000,
//       enter_setup_mode: false,
//       type: 'BIOS',
//       retry: false
//     },
//     serial_ports: [],
//     boot_devices: [],
//     guest_OS: 'SLES_12_64',
//     hardware: {
//       upgrade_policy: 'NEVER',
//       upgrade_status: 'NONE',
//       version: 'VMX_11'
//     }
//   }
// }



export async function getClusters(dataCenter: DataCenter<"vCenter">) {

    let clusters = [];

    const response = await fetchVCenterApi(`/vcenter/resource-pool`, dataCenter);

    if (!response.ok) {
        throw new Error(`Failed to fetch cluster data from ${dataCenter.apiUrl}: ${response.statusText}`);
    }

    clusters.push(await response.json());

    return clusters as Cluster[];

}

// {
//   name: 'TS4-LTC-vSphere_Cluster_HC01_HUAWEI_VCCS',
//   memory_allocation: {
//     shares: { level: 'NORMAL' },
//     expandable_reservation: false,
//     limit: 216268,
//     reservation: 216268
//   },
//   resource_pools: [],
//   cpu_allocation: {
//     shares: { level: 'NORMAL' },
//     expandable_reservation: true,
//     limit: -1,
//     reservation: 0
//   }
// }


export async function getNetworks(dataCenter: DataCenter<"vCenter">) {

    let networks = [];

    const response = await fetchVCenterApi(`/vcenter/network`, dataCenter);

    if (!response.ok) {
        throw new Error(`Failed to fetch network data from ${dataCenter.apiUrl}: ${response.statusText}`);
    }

    networks.push(await response.json());

    return networks as Network[];

}

 // {
    //   name: 'TS4_EXT_3353_VCCS_SERVICE_PLANE',
    //   type: 'DISTRIBUTED_PORTGROUP',
    //   network: 'dvportgroup-81730'
    // },
    // {
    //   name: 'TS4_EXT_3361_VCCS_SIGTRAN1',
    //   type: 'DISTRIBUTED_PORTGROUP',
    //   network: 'dvportgroup-81732'
    // },
    // {
    //   name: 'TS4_EXT_3362_VCCS_SIGTRAN2',
    //   type: 'DISTRIBUTED_PORTGROUP',
    //   network: 'dvportgroup-81733'
    // },
    // {
    //   name: 'TS4_PEDT_3354_VCCS_SERVICE_PLANE',
    //   type: 'DISTRIBUTED_PORTGROUP',
    //   network: 'dvportgroup-81734'
    // },
    // {
    //   name: 'TS4_PEDT_3359_VCCS_DR',
    //   type: 'DISTRIBUTED_PORTGROUP',
    //   network: 'dvportgroup-81735'
    // },
    // {
    //   name: 'TS4_EXT_3355_VCCS_OUM',
    //   type: 'DISTRIBUTED_PORTGROUP',
    //   network: 'dvportgroup-81731'
    // }


export async function getVdc(dataCenter: DataCenter<"vCenter">) {

    const response2 = await fetchVCenterApi(`/vcenter/datacenter`, dataCenter);

    // [ { name: 'TS4_vSphere_Datacenter', datacenter: 'datacenter-11718' } ]

    // {
    //   datastore_folder: 'group-s11721',
    //   host_folder: 'group-h11720',
    //   network_folder: 'group-n11722',
    //   name: 'TS4_vSphere_Datacenter',
    //   vm_folder: 'group-v11719'
    // }


   
}





