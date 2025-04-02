import { createCommand } from "commander";
import { context } from "../../globals";
import { openInEditor } from "../../lib/open-editor";

export async function scanEnvironment(environmentName: string, options?: {
    html?: boolean,
    open?: boolean,
    version?: string,
    noSave?: boolean
}) {
    const environment = await context.cmsClient.environments.get(environmentName);
    const version = await context.cmsClient.environments(environmentName).versions(options?.version || environment.currentVersionName).get();
    //TODO Indicate scan to stderr, as this is a long running task
    const scan = await context.cmsClient.environments(environmentName).versions(version.name).scan({ noSave: options?.noSave });

    if (context.config.json) {


        context.log(JSON.stringify(scan, undefined, '\t'))
        return scan;
    }

    if (options?.html) {
        context.log(JSON.stringify(scan, undefined, '\t'))
        context.cmsClient.compare(
            {
                ...version.model, modelMetadata: { type: "environment", data: { environment, version } }
            },
            {
                ...scan.scannedDataModel || { dataCenters: [] }, modelMetadata: { type: "scan", data: scan }
            },
            {
                html: {
                    open: options?.open
                }
            }
        );
        return scan;
    }

    if (options?.open) {
        openInEditor(scan, `${context.config.clientOptions.dataDir}/output/scan::${scan.id}.json`)
    }

    //TODO Show scan result to terminal properly
    context.log(JSON.stringify(scan, undefined, '\t'))
    return scan;
}

export const scan = createCommand('scan')
    .description('scan environment')
    .arguments('<environment-name>')
    .option('--html', 'generate html report')
    .option('--open', 'open generated report')
    .option('--version, -v <version-name>', 'view specific version')
    .option('--no-save', 'dont save scan result')
    .action(async (environmentName) => {
        const options = scan.opts();
        await scanEnvironment(environmentName, options)
    });