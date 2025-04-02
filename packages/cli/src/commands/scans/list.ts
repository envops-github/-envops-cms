import { createCommand } from "commander"
import { context } from "../../globals";
import Table from "cli-table";

export async function listScans() {
    let scans = await Promise.all((await context.cmsClient.scans.list()).map(id => context.cmsClient.scans.get(id)));

    if (context.config.json) {
        context.log(scans)
        return scans;
    }

    const table = new Table({
        head: ['#', 'ID', 'Environment', 'Version', 'Scanned At', 'Status'],
        rows: scans.map((scan, i) =>
            [
                (i + 1).toString(),
                scan.id, scan.environmentName,
                scan.environmentVersionName,
                new Date(scan.startTime).toLocaleString(),
                scan.status,
            ])
    });

    context.log(table.toString());

    return scans;
}


export const list = createCommand('list')
    .description('list scans')
    .action(async () => {
        await listScans()
    })
