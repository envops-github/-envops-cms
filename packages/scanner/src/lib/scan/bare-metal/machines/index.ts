import { DataCenter } from "@envops-cms/model";
import { NodeSSH } from "node-ssh";
import path from "path";
import { fileURLToPath } from "url";
import fs, { mkdirSync, rmSync } from "fs";
import { SSHCredentials } from "@envops-cms/model";


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

    if (!dataCenter.machines.length) {
        output.error = "SSH credentials are required.";
        return output
    }

    const __filename = fileURLToPath(import.meta.url);
    const __dirnameFile = path.dirname(__filename);
    const localFile = path.resolve(__dirnameFile, "../../../../../binaries/system-scan-linux-arm64");

    if (!fs.existsSync(localFile)) {
        output.error = `The executable file ${localFile} was not found locally`;
        return output
    }

    const tempDir = `${process.cwd()}/temp`;
    mkdirSync(tempDir);

    const remoteFilename = 'system-info-reader-linux-arm64';
    const outputFilename = 'system-info.json';
    const localOutputFile = `${tempDir}/${outputFilename}`;

    const ssh = new NodeSSH();

    for (let i = 0; i < dataCenter.machines.length; i++) {
        let machine = dataCenter.machines[i] as {id: string, sshCreds: SSHCredentials};

        try {
            await ssh.connect({
                host: machine.sshCreds.host,
                port: machine.sshCreds.port,
                username: machine.sshCreds.username,
                password: machine.sshCreds.password,
                tryKeyboard: true,
                readyTimeout: 5000,
            });

            const workDir = await ssh.execCommand('pwd');

            if (workDir.stderr) {
                output.sshError = [];
                output.sshError.push({ id: machine.id, error: `Could not determine working directory on ${machine.sshCreds.host}` });
                return output
            }

            const remoteFile = `${workDir.stdout}/${remoteFilename}`;

            await ssh.putFile(localFile, remoteFile);
            await ssh.execCommand(`chmod +x ${remoteFilename}`);

            const result = await ssh.execCommand(`${remoteFilename} -o file`);

            if (result.stderr) {
                output.sshError = [];
                output.sshError.push({ id: machine.id,  error: `Failed to execute the command ${remoteFilename} -o file on ${machine.sshCreds.host}` });
                return output
            }

            await ssh.getFile(localOutputFile, `${workDir.stdout}/${outputFilename}`);

            await ssh.execCommand(`rm -f ${remoteFilename} ${outputFilename}`);

            if (fs.existsSync(localOutputFile)) {
                const outputFile = JSON.parse((fs.readFileSync(localOutputFile, 'utf-8')));
                output.machines.push({ id: machine.id, data: outputFile });
            }

        } catch (error) {
            output.error = error instanceof Error ? error.message : "Unknown error";
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