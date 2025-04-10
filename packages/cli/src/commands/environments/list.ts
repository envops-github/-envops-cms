import Table from "cli-table";
import { createCommand } from "commander";
import { context } from "../../globals";

export async function listEnvironments() {
    let environments = await Promise.all((await context.cmsClient.environments.list()).map(name => context.cmsClient.environments.get(name)));

    if (context.config.json) {
        context.log(environments)
        return environments;
    }

    const table = new Table({
        head: ['#', 'Environment', 'Current Version'],
        rows: environments.map((environment, i) => [(i + 1).toString(), environment.name, environment.currentVersionName])
    });

    context.log(table.toString());

    return environments;
}

export const list = createCommand('list')
    .description('list environment')
    .action(async () => {
        await listEnvironments()
    })

