import { DataCenter } from "@envops-cms/model";
import { fetchVCloudApi, extractPathname } from "./fetch";
import { vCloudRecord } from ".";


export type Vdc = {
  name: string;
  vdcStorageProfiles: {
    vdcStorageProfile: {
      href: string
    }[]
  };
  availableNetworks: {
    network: {
      href: string
    }[]
  };
  resourceEntities: {
    resourceEntity: {
      href: string
    }[]
  }
};


export async function getVdc(dataCenter: DataCenter<"vCloud">) {
  const response = await fetchVCloudApi(`/query?type=orgVdc&filter=name==${encodeURI(dataCenter.vdcName)}`, dataCenter);
  const vdcLink = (await response.json() as { record: vCloudRecord[] }).record[0].href;

  if (!vdcLink) {
    throw new Error(`VDC with name "${dataCenter.vdcName}" not found.`);
  }

  const vdcId = extractPathname(vdcLink);

  const VDCresponse = await fetchVCloudApi(`${vdcId}`, dataCenter);

  const vdc = await VDCresponse.json()

  return vdc as Vdc;
}




