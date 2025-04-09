import { DataCenter } from "@envops-cms/model";
import { scanToModel } from "./model";
import { v4 } from "uuid";
import { scanBareMetal } from "./machines";

export async function scanBareMetalDataCenter(dataCenter: DataCenter<"BareMetal">) {
    dataCenter.machines = dataCenter.machines.map((machine) => ({ ...machine, id: v4() }));

    const [
        machinesData,
    ] = await Promise.all([
        scanBareMetal(dataCenter),
    ])

    const scannedData = { machinesData };
    console.log(machinesData.sshError, machinesData)
    const scannedDataModel = scanToModel(scannedData, dataCenter);

    return { resultModel: scannedDataModel, scannedData }

}