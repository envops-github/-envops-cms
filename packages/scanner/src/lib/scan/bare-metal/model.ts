import { DataCenter } from "@envops-cms/model";
import { MachineData } from "./machines/index";


export function scanToModel(
    scannedData: { machinesData: MachineData },
    srcModel: DataCenter<"BareMetal">
): DataCenter<"BareMetal"> {

    return {
        name: srcModel.name,
        providerName: srcModel.providerName,
        versions: srcModel.versions,
        machines: scannedData.machinesData.machines.map((machine) => {

            const sourceMachine = srcModel.machines.find((d) => d.id == machine.id);
            return {
                sshCreds: {
                    host: sourceMachine?.sshCreds.host || '',
                    password: sourceMachine?.sshCreds.password,
                    username: sourceMachine?.sshCreds.username,
                    port: sourceMachine?.sshCreds.port,
                    privateKey: sourceMachine?.sshCreds.privateKey
                },
                versions: machine.data.versions.map(v => ({
                    name: v.name,
                    command: v.command,
                    version: v.foundVersion || ''
                })) || [],
                hostname: machine.data.os.hostname,
                osName: machine.data.os.distro,
                osVersion: machine.data.os.release,
                cpuCores: machine.data.cpu.cores,
                memoryGb: Math.round(machine.data.mem.total / Math.pow(1024, 3)),
                nics: machine.data?.net.map((net) => {
                    return {
                        name: net.ifaceName,
                        mac: net.mac,
                        ipv4Address: net.ip4 ? net.ip4 : null,
                        ipv6Address: net.ip6 ? net.ip6 : null,
                        ipv4subnet: net.ip4subnet ? net.ip4subnet : null,
                        ipv6subnet: net.ip6sunbet ? net.ip6sunbet : null,
                    }
                }),
                disks: machine.data.fsSize.map((disk) => {
                    return {
                        sizeGb: Math.round(disk.size / Math.pow(1024, 3)),
                        name: disk.fs
                    }
                })
            }
        })
    }
}