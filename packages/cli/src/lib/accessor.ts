import { EnvironmentModel, ModelMetadata } from "@envops-cms/model";
import { context } from "../globals";

const versionAccessorAliases = ['version', 'versions', 'v'];

export async function getAccessorModel(accessor: string, delimiter: string = "::"): Promise<EnvironmentModel & { modelMetadata: ModelMetadata }> {
    const segments = accessor.split(delimiter);

    switch (segments[0]) {
        case 'scan':
        case 'scans':
            const scan = await context.cmsClient.scans.get(segments[1]);
            return { ...(scan.scannedDataModel || { dataCenters: [] }), modelMetadata: { type: "scan", data: scan } }
        case 'env':
        case 'environment':
        case 'environments':
            if (!segments[1]) {
                throw new Error("expected environment name after environment alias segment")
            }

            const environment = await context.cmsClient.environments(segments[1]).get();

            if (segments[2] && !versionAccessorAliases.includes(segments[2])) {
                throw new Error("expected version alias or end of accessor after environment name segment")
            }

            if (segments[2] && !segments[3]) {
                throw new Error("expected version name after version alias segment")
            }

            const version = await context.cmsClient.environments(environment.name).versions(segments[3] || environment.currentVersionName).get()

            return { ...version.model, modelMetadata: { type: "environment", data: { version, environment } } }
        default:
            throw new Error(`unknown accessor ${segments[0]}`);
    }
}