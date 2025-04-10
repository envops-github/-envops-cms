import { program } from "commander";
import * as hooks from './hooks';
import { init } from "./commands/init";
import { environments } from "./commands/environments";
import { scans } from "./commands/scans";

import { compare } from "./commands/compare";

const cli = program;

cli.name('envops-cms').description('Envops CMS CLI').version('1.0.0')
    .showSuggestionAfterError(true)
    .showHelpAfterError(true)
    .option(
        '--data-dir, -D <path>',
        'envops-cms data directory path'
    )
    .option('--config, -c <path>', `config file path`)
    .option('--json', 'output in json format if possible')
    .option('--silent, -s', 'disable output to stdout. (will still output to file if --output-file is set)')
    .option('--output-file, -o <path>', 'write output to file');
;

cli.addCommand(init);
cli.addCommand(environments);
cli.addCommand(compare)
cli.addCommand(scans)

cli.hook('preAction', hooks.onPreAction);
cli.hook('postAction', hooks.onPostAction);
cli.hook('preSubcommand', hooks.onPreSubcommand);

export { cli };