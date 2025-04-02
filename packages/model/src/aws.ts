export type DataCenter = {
    name: string,
    providerName: 'AWS',
}


export function isDataCenter(dc: any): dc is DataCenter {
    const { name, providerName, ...rest } = <DataCenter>dc;
    return typeof name == 'string'
        && typeof providerName == 'string'
        && !Object.keys(rest).length
}
