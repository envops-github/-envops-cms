import { DataCenter } from "@envops-cms/model";

export async function fetchVCloudApi(path: string, dataCenter: DataCenter<"vCloud">, requestInit?: RequestInit) {
    if (path.startsWith(dataCenter.apiUrl)) {
        path = extractPathname(path);
    }

    if (dataCenter.apiUrl.endsWith('/') && path.startsWith('/')) {
        path = path.slice(1);
    }

    if (!dataCenter.apiUrl.endsWith('/') && !path.startsWith('/')) {
        path = '/' + path;
    }

    const response = await fetch(`${dataCenter.apiUrl}${path}`, !requestInit ? {
        headers: {
            "Accept": "application/*+json;version=" + dataCenter.apiVersion,
            "Authorization": `Bearer ${dataCenter.apiToken}`,
        },
    } : requestInit)

    if (!response.ok) {
        throw new Error(`Failed to fetch data from ${dataCenter.apiUrl}${path}: ${response.statusText}`,);
    }

    return response;
}

export function extractPathname(vdcLink: string) {
    const url = new URL(vdcLink);
    return url.pathname.split("/api/")[1];
}


export async function getToken(dataCenter: DataCenter<"vCloud">) {

    const response = await fetchVCloudApi(`${dataCenter.apiUrl}sessions`, dataCenter, {
        method: "POST",
        headers: {
            "Accept": "application/*+xml;version=" + dataCenter.apiVersion,
            "Authorization": "Basic " + btoa(`${dataCenter.apiUsername}@${dataCenter.org}:${dataCenter.apiPassword}`)
        }
    });

    const token = response.headers.get("X-VMWARE-VCLOUD-ACCESS-TOKEN") as string;;

    return token;
}