import { DataCenter, VCloud, AWS, VCenter, BareMetal} from "@envops-cms/model";
import { scanVCloudDataCenter } from "./vcloud";
// import { scanAWSDataCenter } from "./aws";
//import { scanVCenterDataCenter } from "./vcenter";
import { scanBareMetalDataCenter } from "./bare-metal/index";

export async function scanDataCenter(dataCenter: DataCenter) {

    let providerData = {} as Awaited<ReturnType<typeof scanVCloudDataCenter | typeof scanBareMetalDataCenter>>;
    let foundProvider = false;

    if (VCloud.isDataCenter(dataCenter)) {
        foundProvider = true;
        providerData = await scanVCloudDataCenter(dataCenter);
    }

    // if (AWS.isDataCenter(dataCenter)) {
    //     foundProvider = true;
    //     providerData = await scanAWSDataCenter(dataCenter);
    // }

    // if (VCenter.isDataCenter(dataCenter)) {
    //     foundProvider = true;
    //     providerData = await scanVCenterDataCenter(dataCenter)
    // }

    if (BareMetal.isDataCenter(dataCenter)) {
        foundProvider = true;
        providerData = await scanBareMetalDataCenter(dataCenter);
    }

    if (!foundProvider) {
        throw new Error(`unknown data center: \n${JSON.stringify(dataCenter, undefined, '\t')}`);
    }

    return { ...providerData };


}