import Table from "cli-table";
import { createCommand } from "commander";
import { context } from "../../../globals";

export async function listEnvironmentVersions(environmentName: string) {
    const environment = await context.cmsClient.environments.get(environmentName);
    const versions = await Promise.all((await context.cmsClient.environments(environmentName).versions.list()).map(name => context.cmsClient.environments(environmentName).versions.get(name)));

    if (context.config.json) {
        context.log(versions)
        return versions;
    }

    const table = new Table({
        head: ['#', 'Environment', 'Version', 'Created At', 'Model', 'Current'],
        rows: versions.map((version, i) => [(i + 1).toString(), environmentName, version.name, new Date(version.createdAt).toLocaleString(), JSON.stringify(version.model, undefined,'  '), version.name == environment.currentVersionName ? '✓' : ''])
    });

    context.log(table.toString());

    return versions;
}

export const list = createCommand('list')
    .argument('<environment-name>')
    .description('list versions')
    .action(async (environmentName) => {
        await listEnvironmentVersions(environmentName)
    })

