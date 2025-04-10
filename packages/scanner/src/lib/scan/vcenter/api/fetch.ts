import { DataCenter } from "@envops-cms/model";

export async function fetchVCenterApi(path: string, dataCenter: DataCenter<"vCenter">, requestInit?: RequestInit) {
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


export async function getToken(dataCenter: DataCenter<"vCenter">) {

    const response = await fetchVCenterApi(`${dataCenter.apiUrl}api/vcenter/authentication/token`, dataCenter, {
        method: "POST",
        headers: {
            "Authorization": "Basic " + btoa(`${dataCenter.apiUsername}:${dataCenter.apiPassword}`)
        }
    });

    const tocken = (await response.json()) as {value: string};

    return tocken.value;
}