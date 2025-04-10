import { SSHCredentials } from "@envops-cms/model";
import { NodeSSH } from "node-ssh";

export type MachineData = {
    id: string,
    versions: Version[],
    error?: string
}

export type Version = {
    name: string,
    command: string;
    foundVersion?: string,
    error?: string
}

export async function scanMachine(machine: { id: string, sshCreds?: SSHCredentials, versions: { name: string, command: string }[] }) {

    let output: MachineData = { id: machine.id, versions: [] };

    if (!machine.sshCreds) {
        output.error = "SSH credentials are required.";
        return output
    }

    if (!machine.versions.length) {
        return output;
    }

    const ssh = new NodeSSH();

    try {
        await ssh.connect({
            host: machine.sshCreds.host,
            port: machine.sshCreds.port,
            username: machine.sshCreds.username,
            password: machine.sshCreds.password,
            tryKeyboard: true,
            readyTimeout: 5000,
        });


        await Promise.all(machine.versions.map(async (version) => {
            const result = await ssh.execCommand(version.command);
            const versionOut = { command: version.command, name: version.name };

            if (result.stderr) {
                output.versions.push({ ...versionOut, error: result.stderr })
                return;
            }
            output.versions.push({ ...versionOut, foundVersion: result.stdout });
        }))

    } catch (error) {
        output.error = error instanceof Error ? error.message : "Unknown error";
    } finally {
        ssh.dispose();
    }

    return output;
}