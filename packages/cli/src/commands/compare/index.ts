import { createCommand } from "commander";
import { getAccessorModel } from "../../lib/accessor";
import { context } from "../../globals";
import { openInEditor } from "../../lib/open-editor";

export async function compareModelsCommand(
    sourceAccessor: string,
    targetAccessor: string,
    options?: {
        html?: boolean,
        open?: boolean,
        delimiter?: string
    }) {

    const sourceModel = await getAccessorModel(sourceAccessor, options?.delimiter);
    const targetModel = await getAccessorModel(targetAccessor, options?.delimiter);

    const comparison = await context.cmsClient.compare(sourceModel, targetModel, {
        html: options?.html ? {
            open: options.open
        } : undefined
    });

    if (context.config.json) {
        context.log(JSON.stringify(comparison, undefined, '\t'));
        return comparison;
    }

    if (!options?.html && options?.open) {
        openInEditor(comparison, `${context.config.clientOptions.dataDir}/output/comparison::${new Date().toISOString()}.json`)
    }
    context.log(JSON.stringify(comparison, undefined, '\t'));
    return comparison
}

const compare = createCommand('compare')
    .description('Compare configuration models (scan -> environment, environment->environment, environment -> scan, etc...)')
    .arguments('<source-item-accessor> <target-item-accessor>')
    .option('--html', 'generate html report')
    .option('--open', 'open generated report')
    .option("-d, --delimiter", "accessor delimiter, default :: ")
    .action(async (sourceAccessor, targetAccessor) => {
        const options = compare.opts();
        await compareModelsCommand(sourceAccessor, targetAccessor, options)
    })
export { compare };
