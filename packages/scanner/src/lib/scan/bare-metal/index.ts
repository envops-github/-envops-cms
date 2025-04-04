import { DataCenter } from "@envops-cms/model";
import { rmSync } from "fs";
import { NodeSSH } from "node-ssh";
import path from "path";
import { fileURLToPath } from "url";

export async function scanBareMetalDataCenter(dataCenter: DataCenter<"BareMetal">) {

    let output = {};

    if (!dataCenter.bareMetalsshCreds.length) {
        // output.error = "SSH credentials are required.";
        // return output
    }

    const ssh = new NodeSSH();

    //await Promise.all(dataCenter.bareMetalsshCreds.map(async (machine) => {

    for (let i = 0; i < dataCenter.bareMetalsshCreds.length; i++) {
        const machine = dataCenter.bareMetalsshCreds[i];

        try {
            await ssh.connect({
                host: machine.host,
                port: machine.port,
                username: machine.username,
                password: machine.password,
                tryKeyboard: true,
                readyTimeout: 5000,
            });

            const __filename = fileURLToPath(import.meta.url);
            const __dirname = path.dirname(__filename);

            const workDir = ((await ssh.execCommand(`pwd`))).stdout;

            await ssh.putFile('./packages/scanner/src/lib/scan/bare-metal/test.txt', '/root');
            const result = await ssh.execCommand('./system-info-reader-linux-arm64 -o');
            await ssh.getFile('/root/system-info.json', __dirname);
            await ssh.execCommand('rm system-info-reader-linux-arm64 system-info.json')



        } catch (error) {
            console.log(machine, error)
            //output.error = error instanceof Error ? error.message : "Unknown error";
        } finally {
            ssh.dispose();
        }


    }


    //}))


    return output;

}