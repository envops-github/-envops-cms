import { DEFAULT_CMS_CLIENT_OPTIONS, EnvopsCMSClientOptions } from "@envops-cms/client";
import { Result } from "@envops-cms/utils";

export type EnvopsCmsCliConfig = EnvopsCmsCliJsonConfig

export type EnvopsCmsCliJsonConfig = {
    clientOptions: EnvopsCMSClientOptions,
    json?: boolean,
    silent?: boolean,
    outputFile?: string
}

export const DEFAULT_CLI_CONFIG_PATH = '.';
export const DEFAULT_CLI_CONFIG_NAME = 'envops-cms.config.json';

export const DEFAULT_CLI_CONFIG: EnvopsCmsCliConfig = {
    clientOptions: DEFAULT_CMS_CLIENT_OPTIONS
}

export function validateEnvopsCmsCliJsonConfig(jsonConfig: any): Result {
    let result = {
        success: true
    } as Result

    const { clientOptions } = <EnvopsCmsCliJsonConfig>jsonConfig;

    if (clientOptions.dataDir && typeof clientOptions.dataDir !== 'string') {
        result = {
            success: false,
            error: new Error(`clientOptions.dataDir must be of type string, found value: ${clientOptions.dataDir}`)
        }
        return result;
    }

    return result;
}