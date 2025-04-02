import { createCommand } from "commander";
import Table from "cli-table";
import { context } from "../../../globals";
import { openInEditor } from "../../../lib/open-editor";

export async function viewEnvironmentVersion(environmentName: string, versionName: string, options?: { html?: boolean, open?: boolean }) {
    let version = await context.cmsClient.environments(environmentName).versions.get(versionName);

    if (options?.html) {
        context.log(version)
        return await context.cmsClient.environments(environmentName).versions(versionName).createHtml({ open: options.open });
    }

    if (options?.open) {
        openInEditor(version, `${context.config.clientOptions.dataDir}/output/env::${environmentName}::version::${version.name}::${new Date().toISOString()}.json`)
    }

    if (context.config.json) {
        context.log(version)
        return version;
    }
    const table = new Table({
        head: ['Property', 'Value'],
        rows: Object.entries(version).map(([k, v]) => [k, JSON.stringify(v, undefined, '  ')])
    });
    context.log(table.toString());

    return version
}

export const view = createCommand('view')
    .arguments('<environment-name> <version-name>')
    .option('--html', 'generate html report')
    .option('--open', 'open generated report')
    .description('view environment version')
    .action(async (environmentName, versionName) => {
        const options = view.opts();
        await viewEnvironmentVersion(environmentName, versionName, options);
    })
