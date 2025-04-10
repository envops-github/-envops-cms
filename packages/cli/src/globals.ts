import { DEFAULT_CMS_CLIENT_OPTIONS, EnvopsCmsClient } from "@envops-cms/client";
import { DEFAULT_CLI_CONFIG } from "./config";
import { Logger } from "./logger";

export const context = {
    config: DEFAULT_CLI_CONFIG,
    cmsClient: new EnvopsCmsClient({ ...DEFAULT_CMS_CLIENT_OPTIONS, autoInit: false }),
    log: ((data: any) => { }) as InstanceType<typeof Logger>['log']
}
