import { createCommand } from "commander";
import { context } from "../../globals";
import { openInEditor } from "../../lib/open-editor";
import Table from "cli-table";

export async function viewScan(id: string, options?: { html?: boolean, open?: boolean }) {

    const scan = await context.cmsClient.scans.get(id);

    if (options?.html) {
        context.log(scan)
        return await context.cmsClient.scans(id).createHtml({ open: options.open });
    }


    if (options?.open) {
        openInEditor(scan, `${context.config.clientOptions.dataDir}/output/scan::${scan.id}.json`)
    }

    if (context.config.json) {
        context.log(scan)
        return scan;
    }
    const table = new Table({
        head: ['Property', 'Value'],
        rows: Object.entries(scan).map(([k, v]) => [k, JSON.stringify(v, undefined, '  ')])
    });
    context.log(table.toString());

    return scan;
}

export const view = createCommand('view')
    .argument('<scan-id>')
    .option('--html', 'generate html report')
    .option('--open', 'open generated report')
    .description('view scan')
    .action(async (scanId) => {
        const options = view.opts();
        await viewScan(scanId, options);
    })
