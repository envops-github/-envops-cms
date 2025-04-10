import { createCommand } from "commander";
import Table from "cli-table";
import { context } from "../../globals";
import { viewEnvironmentVersion } from "./versions/view";
import { openInEditor } from "../../lib/open-editor";

export async function viewEnvironment(name: string, options?: { html?: boolean, version?: string, open?: boolean }) {

    if (options?.version) {
        return await viewEnvironmentVersion(name, options.version, options);
    }

    const environment = await context.cmsClient.environments.get(name);

    if (options?.html) {
        context.log(environment)
        return await context.cmsClient.environments(name).versions(environment.currentVersionName).createHtml({ open: options.open });
    }


    if (options?.open) {
        openInEditor(environment, `${context.config.clientOptions.dataDir}/output/env::${environment.name}::${new Date().toISOString()}.json`)
    }

    if (context.config.json) {
        context.log(environment)
        return environment;
    }
    const table = new Table({
        head: ['Property', 'Value'],
        rows: Object.entries(environment)
    });
    context.log(table.toString());

    return environment
}

export const view = createCommand('view')
    .argument('<environment-name>')
    .option('--html', 'generate html report')
    .option('--open', 'open generated report')
    .option('--version, -v <version-name>', 'view specific version')
    .description('view environment')
    .action(async (environmentName) => {
        const options = view.opts();
        await viewEnvironment(environmentName, options);
    })
