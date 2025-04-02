import { SSHCredentials } from "./environment-model"

export type DataCenter = {
    name: string,
    providerName: 'BareMetal',
    bareMetalsshCreds: SSHCredentials[],
}

export function isDataCenter(dc: any): dc is DataCenter {
    const { name, providerName, bareMetalsshCreds,...rest } = <DataCenter>dc;
    return typeof name == 'string'
        && typeof providerName == 'string'
        && !Object.keys(rest).length
}