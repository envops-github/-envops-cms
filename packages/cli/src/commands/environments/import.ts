import { existsSync, readFileSync } from "fs";
import { createCommand } from "commander";
import { context } from "../../globals";

export async function importEnvironment(path: string) {
    if (!existsSync(path)) {
        importCommand.error(`file not found: ${path}`);
    }

    const file = readFileSync(path, { encoding: 'utf-8' });
    let environment: Parameters<typeof context.cmsClient.environments.create>[0];
    try {
        environment = JSON.parse(file);

    } catch (error) {
        importCommand.error(`file is not valid environment json: ${path}` + error)
        return;
    }

    try {
        const result = await context.cmsClient.environments.create(environment)
        if (context.config.json) {
            context.log(result)
            return;
        }

        context.log(`environment created: ${result.name}`)
    } catch (error) {
        importCommand.error("failed to import environment.\n error: " + error)
    }
}

export const importCommand = createCommand('import')
    .argument('<path>')
    .description('import environment')
    .action(async (path) => {
        await importEnvironment(path)
    })
