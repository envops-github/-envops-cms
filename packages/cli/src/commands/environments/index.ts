import { createCommand } from "commander";
import { view } from "./view";
import { list } from "./list";
import { importCommand } from "./import";
import { versions } from "./versions";
import { scan } from "./scan";
import { createScanner } from "./create-scanner";

const environments = createCommand('environments')
    .aliases(['env', 'environment'])
    .description('Manage environments')

environments.addCommand(list, { isDefault: true });
environments.addCommand(view);
environments.addCommand(importCommand);
environments.addCommand(versions);
environments.addCommand(scan);
environments.addCommand(createScanner);

export { environments };
