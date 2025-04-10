import { ScannerConfig } from "../..";
import { scanDataCenter } from "./data-center";
import { EnvironmentModel } from "@envops-cms/model";

export async function scanEnvironmentModel(config: ScannerConfig): Promise<{ scannedDataModel: EnvironmentModel, scannedData: any }> {

    const dataCenterScans = await Promise.all(config.environmentModel.dataCenters.map(dc => scanDataCenter(dc)));

    return {
        scannedDataModel: { dataCenters: dataCenterScans.map(dcs => ({ ...dcs.resultModel})) },
        scannedData: dataCenterScans
     };
}
