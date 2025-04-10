import { DataCenter } from "@envops-cms/model";
import { scanVCloudMachines } from "./machines";
import { scanVCloudApi } from "./api";
import { scanToModel } from "./model";
import { v4 } from "uuid";
import { scanDataCenterK8s } from "../k8s";

export async function scanVCloudDataCenter(dataCenter: DataCenter<"vCloud">) {

    dataCenter.vApps = dataCenter.vApps.map((vapp) => ({ ...vapp, vms: vapp.vms.map((vm => ({ ...vm, id: v4() }))) }));

    const [
        apiData,
        machinesData,
        k8s
    ] = await Promise.all([
        scanVCloudApi(dataCenter),
        scanVCloudMachines(dataCenter),
        scanDataCenterK8s(dataCenter)
    ])

    const scannedData = { apiData, machinesData, k8s};
    const scannedDataModel = scanToModel(scannedData, dataCenter);

    return { resultModel: scannedDataModel, scannedData }

}
