import { existsSync, mkdirSync } from "fs";
import { EnvopsCmsClient } from "../index";
import { CallableController } from "../callable-controller/index";
import { readdir, readFile, writeFile } from "fs/promises";
import { isScan, Scan } from "@envops-cms/model";
import { OmitTupleFirst } from "@envops-cms/utils";
import path from "path";

export type ScansCallableController = ScansController & typeof ScansController.prototype.callable

export class ScansController extends CallableController {
    constructor(private _client: EnvopsCmsClient) {
        super();

        if (!existsSync(`${this._client.options.dataDir}/data/scans`)) {
            mkdirSync(`${this._client.options.dataDir}/data/scans`, { recursive: true });
        }
    }

    callable(id: string) {
        return {
            get: async () => await this.get(id),
            createHtml: async (...params: OmitTupleFirst<Parameters<typeof this.createHtml>>) => await this.createHtml(id, ...params),
        }
    }

    async get(id: string): Promise<Scan> {

        if (!existsSync(`${this._client.options.dataDir}/data/scans/${id}.json`)) {
            throw new Error(`Scan ${id} not found`);
        }

        return JSON.parse(await readFile(`${this._client.options.dataDir}/data/scans/${id}.json`, { encoding: 'utf-8' }))
    }

    async list() {
        return (await readdir(`${this._client.options.dataDir}/data/scans`)).map(scanJsonFile => scanJsonFile.slice(0, scanJsonFile.indexOf('.json')))
    }

    async save(scan: Scan) {
        if (existsSync(`${this._client.options.dataDir}/data/scans/${scan.id}.json`)) {
            throw new Error(`Scan ${scan.id} already exists`)
        }

        try {
            await writeFile(`${this._client.options.dataDir}/data/scans/${scan.id}.json`, JSON.stringify(scan));
        } catch (error) {
            throw new Error(`Failed to save scan ${scan.id}`)
        }
    }

    async import(path: string) {
        if (!existsSync(path)) {
            throw new Error(`file not found: ${path}`);
        }
        let scan: Scan;
        try {
            scan = JSON.parse(await readFile(path, { encoding: 'utf-8' }));
            if (!isScan(scan)) {
                throw new Error();
            }

        } catch (error) {
            throw new Error(`Invalid scan input file`);
        }

        await this.save(scan);
    }

    async createHtml(id: string, options?: { outputDir?: string, open?: boolean }) {

        const scan = await this.get(id);
        const environment = await this._client.environments(scan.environmentName).get();
        const version = await this._client.environments(scan.environmentName).versions(scan.environmentVersionName).get();

        if (options?.outputDir && !path.isAbsolute(options.outputDir)) {
            (options as Required<typeof options>).outputDir = path.join(process.cwd(), options.outputDir)
        }

        const outputDir = options?.outputDir || `${this._client.options.dataDir}/output/scan-${id}/html`;

        this._client.compare(
            {
                ...scan.environmentModel, modelMetadata: { type: "environment", data: { environment, version } }
            },
            {
                ...scan.scannedDataModel || { dataCenters: [] }, modelMetadata: { type: "scan", data: scan }
            },
            {
                html: {
                    open: options?.open
                }
            }
        );

        return outputDir;
    }
}
