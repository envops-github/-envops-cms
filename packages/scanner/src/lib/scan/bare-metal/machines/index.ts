import { DataCenter, BareMetal } from "@envops-cms/model";
import { NodeSSH } from "node-ssh";
import path from "path";
import { fileURLToPath } from "url";
import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";

export type MachineData = {
    machines: {
        data: {
            os: {
                hostname: string,
                distro: string,
                release: string
            },
            cpu: {
                cores: number
            },
            mem: {
                total: number
            },
            net: {
                iface: string,
                ifaceName: string,
                mac: string,
                ip4: string,
                ip4subnet: string,
                ip6: string,
                ip6sunbet: string
            }[],
            fsSize: {
                fs: string,
                size: number
            }[],
            customVersions: {
                command: string,
                name: string,
                foundVersion: string,
                version: string,
                error?: string
            }[]
        },
        id: string,
        error?: string
    }[],
    sshError?: {
        error?: string,
        id: string,
    }[],
    error?: string

}



export async function scanBareMetal(dataCenter: DataCenter<"BareMetal">) {
    let output = { machines: [] } as MachineData;

    const __filename = fileURLToPath(import.meta.url);
    const __dirnameFile = path.dirname(__filename);

    const tempDir = `${process.cwd()}/temp_${dataCenter.name}`;

    let remoteFilename;

    if (!existsSync(tempDir)) {
        mkdirSync(tempDir, { recursive: true });
    }

    const ssh = new NodeSSH();

    for (let machine of dataCenter.machines as (BareMetal.Machine & { id: string })[]) {
        machine.versions = [...(machine.versions || []), ...(dataCenter.versions || [])];

        const outputFilename = `system-info.json`;
        const localOutputFile = `${tempDir}/system-info_${machine.id}.json`;
        try {
            await ssh.connect({
                host: machine.sshCreds.host,
                port: machine.sshCreds.port,
                username: machine.sshCreds.username,
                password: machine.sshCreds.password,
                tryKeyboard: true,
                readyTimeout: 5000,
            });

            const osType = await getOSType(ssh);

            if (osType.error || osType.os == 'unknown' || osType.arch == 'unknown') {
                output.sshError = [];
                output.sshError.push({ id: machine.id, error: `Could not get OS type for ${machine.sshCreds.host}, ${osType.error}` });
                continue;
            }


            switch (osType.os) {
                case "linux":
                    if (osType.arch == 'arm64') {
                        remoteFilename = 'system-scan-linux-arm64';
                    }
                    if (osType.arch == 'x86_64') {
                        remoteFilename = 'system-scan-linux-x64';
                    }
                    break;
                case "darwin":
                    if (osType.arch == 'arm64') {
                        remoteFilename = 'system-scan-macos-arm64';
                    }
                    if (osType.arch == 'x86_64') {
                        remoteFilename = 'system-scan-macos-x64';
                    }
                    break;
                case "windows":
                    if (osType.arch == 'arm64') {
                        remoteFilename = 'system-scan-win-arm64.exe';
                    }
                    if (osType.arch == 'x86_64') {
                        remoteFilename = 'system-scan-win-x64.exe';
                    }
                    break;
                default:
                    output.sshError = [];
                    output.sshError.push({ id: machine.id, error: `Could not get OS type for ${machine.sshCreds.host}, ${osType.error}` });
            }

            const workDir = await ssh.execCommand('pwd');

            if (workDir.stderr) {
                output.sshError = [];
                output.sshError.push({ id: machine.id, error: `Could not determine working directory on ${machine.sshCreds.host}` });
                continue;
            }

            const remoteFile = `${workDir.stdout}/${remoteFilename}`;

            const localFile = path.resolve(__dirnameFile, `../../../../../binaries/${remoteFilename}`);

            if (!existsSync(localFile)) {
                output.error = `The executable file ${localFile} was not found locally`;
                return output
            }

            await ssh.putFile(localFile, remoteFile);
            await ssh.execCommand(`chmod +x ${remoteFilename}`);

            const result = await ssh.execCommand(`./${remoteFilename} -o file`);

            if (result.stderr) {
                output.sshError = [];
                output.sshError.push({ id: machine.id, error: `Failed to execute the command ${remoteFilename} -o file on ${machine.sshCreds.host}` });
                continue;
            }

            await ssh.getFile(localOutputFile, `${workDir.stdout}/${outputFilename}`);

            await ssh.execCommand(`rm -f ${remoteFilename} ${outputFilename}`);

            const outputFile = JSON.parse((readFileSync(localOutputFile, 'utf-8')));

            let machineOut = { id: machine.id, data: outputFile };



            await Promise.all(machine.versions.map(async (version) => {

                const result = await ssh.execCommand(version.command);
                const versionOut = { command: version.command, name: version.name };

                if (result.stderr) {
                    machineOut.data.customVersions.push({ ...versionOut, error: result.stderr })
                    return;
                }

                if (!machineOut.data.customVersions) {
                    machineOut.data.customVersions = [];
                }

                machineOut.data.customVersions.push({ ...versionOut, foundVersion: result.stdout });

            }))

            output.machines.push(machineOut);

        } catch (error) {
            output.error = error instanceof Error ? `${error.message} for ${machine.sshCreds.host}` : "Unknown error";
        } finally {
            ssh.dispose();

            try {
                rmSync(localOutputFile, { recursive: true, force: true });
            } catch (error) {
                console.log(`Failed to cleanup the temp file for ${machine.sshCreds.host}`, error);
            }

        }
    }

    try {
        rmSync(`${tempDir}`, { recursive: true, force: true });
    } catch (error) {
        console.log('Failed to cleanup the temp directory', error);
    }

    return output;

}

async function getOSType(ssh: NodeSSH) {

    try {
        let osResult = await ssh.execCommand('uname -s');
        let archResult = await ssh.execCommand('uname -m');

        if (!osResult.stderr && !archResult.stderr && !osResult.stdout.includes('is not recognized')) {
            return {
                os: parseOS(osResult.stdout.trim()),
                arch: parseArch(archResult.stdout.trim())
            };
        }

        const verResult = await ssh.execCommand('ver');
        if (!verResult.stderr) {
            const archResult = await ssh.execCommand('echo %PROCESSOR_ARCHITECTURE%');
            return {
                os: parseOS(verResult.stdout.trim()),
                arch: parseArch(archResult.stdout.trim())
            };
        }

        return {
            os: 'unknown',
            arch: 'unknown',
            error: 'Could not detect OS type'
        };

    } catch (error) {
        return {
            os: 'unknown',
            arch: 'unknown',
            error: error instanceof Error ? error.message : 'Unknown error'
        };

    }


}

function parseOS(osString: string) {
    const lower = osString.toLowerCase();
    if (lower.includes('linux')) return 'linux';
    if (lower.includes('darwin')) return 'darwin';
    if (lower.includes('windows')) return 'windows';
    return 'unknown';
}

function parseArch(archString: string) {
    const lower = archString.toLowerCase();
    if (lower === 'aarch64' || lower === 'arm64') return 'arm64';
    if (lower === 'x86_64' || lower === 'amd64' || lower === 'x86') return 'x86_64';
    return 'unknown';
}