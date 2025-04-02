import type { EnvironmentModel, Scan } from '@envops-cms/model';
import { v4 } from 'uuid';
import { scanEnvironmentModel } from './lib/scan/model';
import { writeFileSync } from 'fs';

export type ScannerConfig = {
    environmentModel: EnvironmentModel,
    environmentName: string,
    environmentVersionName: string,
}

export class Scanner {
    constructor(private options: ScannerConfig) {

    }

    async scan(): Promise<Scan> {
        const startTime = new Date();
        const { environmentModel, environmentName, environmentVersionName } = this.options;

        const { scannedDataModel, scannedData } = await scanEnvironmentModel(this.options);

        const result = { scannedDataModel, scannedData }

        writeFileSync(`./scan-result-${new Date()}.json`, JSON.stringify(result, undefined, '\t'))


        const id = v4()

        const endTime = new Date();

        const timeMs = endTime.valueOf() - startTime.valueOf();

        return {
            id,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            timeMs,
            environmentModel,
            environmentName,
            environmentVersionName,
            status: 'complete',
            scannedDataModel,
            scannedData
        };
    }
}