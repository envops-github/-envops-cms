import { DataCenter } from "@envops-cms/model";
import { scanMachine } from "../machines";

export async function scanVCloudMachines(dataCenter: DataCenter<"vCloud">) {
    const machines = dataCenter.vApps.map(vapp => vapp.vms.map(vm => ({
        ...vm,
        sshCreds: {
            ...dataCenter.sshCreds,
            ...vapp.sshCreds,
            ...vm.sshCreds
        },
        versions: [...(vapp.versions ?? []), ...(vm.versions?? [])]
    }) as Parameters<typeof scanMachine>[0])).flat();

    const results = await Promise.all(machines.map(async (m) => (({ ...m, ...(await scanMachine(m)) }))));

    return results;
}