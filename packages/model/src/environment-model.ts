import * as VCloud from "./vcloud";
import * as AWS from "./aws";
import * as VCenter from "./vcenter";
import * as BareMetal from "./bare-metal";
import { Scan } from "./scan";
import { Environment, EnvironmentVersion } from "./environment";
import { DataCenterK8S } from "./k8s";


export type SSHCredentials = {
    host: string,
    port?: number,
    username?: string,
    password?: string,
    privateKey?: string
}

export type EnvironmentModel = {
    dataCenters: DataCenter[]
}


export type ModelMetadata = {
    type: "scan",
    data: Scan
} | {
    type: "environment",
    data: { environment: Environment, version: EnvironmentVersion }
}

export type DataCenterProvider = 'vCloud' | 'AWS' | 'vCenter' | 'BareMetal';
export type DataCenterProviderModel<T = DataCenterProvider> =
    (T extends 'vCloud' ? VCloud.DataCenter
        : T extends 'AWS' ? AWS.DataCenter
        : T extends 'vCenter' ? VCenter.DataCenter 
        : T extends 'BareMetal' ? BareMetal.DataCenter
        : unknown)


export type DataCenter<T = DataCenterProvider> =
    DataCenterProviderModel<T>
    & { k8s?: DataCenterK8S }
    & { sshCreds?: SSHCredentials }

export function isEnvironmentModel(model: any): model is EnvironmentModel {
    const { dataCenters, ...rest } = <EnvironmentModel>model;
    return Array.isArray(dataCenters)
        && !dataCenters.some(dc => !isDataCenter(dc))
        && !Object.keys(rest).length;
}

export function isDataCenter(dc: any): dc is DataCenter {
    const { k8s, sshCreds, ...providerDc } = dc;
    return (VCloud.isDataCenter(providerDc) || AWS.isDataCenter(providerDc) || VCenter.isDataCenter(providerDc) || BareMetal.isDataCenter(providerDc))
}
