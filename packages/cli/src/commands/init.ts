import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { createCommand } from "commander";
import { DEFAULT_CLI_CONFIG, DEFAULT_CLI_CONFIG_NAME, DEFAULT_CLI_CONFIG_PATH } from "../config";
import path from "node:path";

export const init = createCommand('init')
    .description('Initialize config')
    .option('--path, -p <path>', 'path where to create config', DEFAULT_CLI_CONFIG_PATH)
    .action(() => {
        const options = init.opts();

        if (!existsSync(options.path)) {
            mkdirSync(options.path, { recursive: true })
        }
        writeFileSync(path.join(options.path, DEFAULT_CLI_CONFIG_NAME), JSON.stringify(DEFAULT_CLI_CONFIG, undefined, '\t'));
    });