import { existsSync, readFileSync } from "fs";
import { createCommand } from "commander";
import { context } from "../../../globals";
import { EnvironmentVersion } from "@envops-cms/model";

export async function importEnvironmentVersion(environmentName: string, path: string, options?: { setCurrent?: boolean }) {
    if (!existsSync(path)) {
        importCommand.error(`file not found: ${path}`);
    }

    const file = readFileSync(path, { encoding: 'utf-8' });
    let version: EnvironmentVersion;
    try {
        version = JSON.parse(file);

    } catch (error) {
        importCommand.error(`file is not valid environment version json: ${path}` + error)
        return;
    }

    try {
        const result = await context.cmsClient.environments(environmentName).versions.create(version, options)
        if (context.config.json) {
            context.log(result)
            return;
        }

        context.log(`environment version created: ${result.name}`)
    } catch (error) {
        importCommand.error("failed to import environment version.\n error: " + error)
    }
}

export const importCommand = createCommand('import')
    .arguments('<environment-name> <path>')
    .option('--set-current', 'set created version as current environment version')
    .description('import version')
    .action(async (environmentName, path) => {
        const options = importCommand.opts()
        await importEnvironmentVersion(environmentName, path, options)
    })
