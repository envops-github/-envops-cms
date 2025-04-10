import { Command } from "commander";
import { DEFAULT_CLI_CONFIG_NAME, DEFAULT_CLI_CONFIG_PATH } from "../config";
import { readFileSync } from "fs";
import { Logger } from "../logger";
import path from "path";
import { context } from "../globals";

export type EnvopsCmsCliGlobalOptions = {
    config?: string,
    dataDir?: string,
    json?: boolean,
    silent?: boolean,
    outputFile?: string
}

export async function onPreAction(thisCommand: Command, actionCommand?: Command) {
    const options = thisCommand.opts() as EnvopsCmsCliGlobalOptions;
    const configPath = options.config || DEFAULT_CLI_CONFIG_PATH;

    try {
        const parsedConfig = JSON.parse(
            readFileSync(path.join(configPath, DEFAULT_CLI_CONFIG_NAME), {
                encoding: "utf8",
            })
        );

        context.config = { ...context.config, ...parsedConfig };
    } catch (error) { }

    context.config.clientOptions.dataDir = options.dataDir || context.config.clientOptions.dataDir;
    context.config.json = options.json || context.config.json;
    context.config.silent = options.silent || context.config.silent;
    context.config.outputFile = options.outputFile || context.config.outputFile

    context.log = (...args) => new Logger({ file: context.config.outputFile, stdout: !context.config.silent }).log(...args);
    context.cmsClient.init(context.config.clientOptions);
}