import { createCommand } from "commander";
import { view } from "./view";
import { list } from "./list";
import { importCommand } from "./import";

const versions = createCommand('versions')
    .aliases(['version'])
    .description('Manage versions')

versions.addCommand(list, { isDefault: true });
versions.addCommand(view);
versions.addCommand(importCommand);

export { versions };