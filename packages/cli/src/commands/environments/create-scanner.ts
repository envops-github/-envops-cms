import { createCommand } from "commander";
import { context } from "../../globals";

export async function createEnvironmentScanner(environmentName: string, versionName?: string) {
    const environment = await context.cmsClient.environments.get(environmentName);
    const version = await context.cmsClient.environments(environmentName).versions(versionName || environment.currentVersionName).get();
    //TODO Add outputdir option
    const outputDir = await context.cmsClient.environments(environmentName).versions(version.name).createScanner();

    if (context.config.json) {
        context.log({ outputDir })
        return outputDir;
    }

    context.log(`Scanner written to ${outputDir}`)
    return outputDir;
}

export const createScanner = createCommand('create-scanner')
    .description('create environment scanner')
    .arguments('<environment-name> [version-name]')
    .action(async (environmentName, versionName) => {
        await createEnvironmentScanner(environmentName, versionName)
    });