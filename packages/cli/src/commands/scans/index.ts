import { createCommand } from "commander";
import { view } from "./view";
import { list } from "./list";

const scans = createCommand('scans')
    .description('Manage scans')

scans.addCommand(list, { isDefault: true });
scans.addCommand(view);

export { scans };
