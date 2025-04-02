import { existsSync } from "fs";
import { EnvopsCmsClient } from "../index";
import { CallableController } from "../callable-controller/index";
import { type EnvironmentVersion, isEnvironmentVersion } from "@envops-cms/model";
import { mkdir, readdir, readFile, writeFile } from "fs/promises";
import { OmitTupleFirst } from "@envops-cms/utils";
import { v4 } from "uuid";
import { createRequire } from 'node:module';
import path from "node:path";
import { Scanner, ScannerConfig } from '@envops-cms/scanner'
import { exec } from 'pkg'
import { rm } from "node:fs/promises";
import { generateHtml } from '@envops-cms/html-report';

export type ScannerTarget = 'linux' | 'macos' | 'win';

export type EnvironmentVersionsCallbaleController = EnvironmentVersionsController & typeof EnvironmentVersionsController.prototype.callable

export class EnvironmentVersionsController extends CallableController {
    constructor(private _client: EnvopsCmsClient, private environmentName: string) {
        super();
    }

    callable(name: string) {

        if (!existsSync(`${this._client.options.dataDir}/data/environments/${this.environmentName}/versions/${name}.json`)) {
            throw new Error(`Environment version ${name} not found`);
        }

        return {
            get: async () => await this.get(name),
            scan: async (...params: OmitTupleFirst<Parameters<typeof this.scan>>) => await this.scan(name, ...params),
            createHtml: async (...params: OmitTupleFirst<Parameters<typeof this.createHtml>>) => await this.createHtml(name, ...params),
            createScanner: async (...params: OmitTupleFirst<Parameters<typeof this.createScanner>>) => await this.createScanner(name, ...params),
        }
    }

    async get(name: string): Promise<EnvironmentVersion> {

        if (!existsSync(`${this._client.options.dataDir}/data/environments/${this.environmentName}/versions/${name}.json`)) {
            throw new Error(`Environment version ${name} not found`);
        }

        return JSON.parse(await readFile(`${this._client.options.dataDir}/data/environments/${this.environmentName}/versions/${name}.json`, { encoding: 'utf-8' }))
    }

    async create(environmentVersionConstruction: Omit<EnvironmentVersion, 'createdAt'>, options?: { setCurrent?: boolean }): Promise<EnvironmentVersion> {

        let { ...version } = environmentVersionConstruction as typeof environmentVersionConstruction & { createdAt: string };
        version.createdAt = new Date().toISOString();

        if (existsSync(`${this._client.options.dataDir}/data/environments/${this.environmentName}/versions/${version.name}.json`)) {
            throw new Error(`Environment version ${version.name} already exists`);
        }

        if (!isEnvironmentVersion(version)) {
            throw new Error(`Invalid environment version constructor: ${JSON.stringify(version)}`);
        }

        await writeFile(`${this._client.options.dataDir}/data/environments/${this.environmentName}/versions/${version.name}.json`, JSON.stringify(version));

        if (options?.setCurrent) {
            await this._client.environments(this.environmentName).modify({
                currentVersionName: version.name
            })
        }

        return version;
    }

    async scan(name: string, options?: { noSave?: boolean }) {
        // TODO Scan options to scan from remote machine
        const version = await this.get(name)

        const scanner = new Scanner({ environmentName: this.environmentName, environmentVersionName: name, environmentModel: version.model });
        const result = await scanner.scan();

        if (!(options?.noSave)) {
            await this._client.scans.save(result);
        }

        return result;
    }

    async createScanner(name: string, options?: { id?: string, outputDir?: string, targets?: ScannerTarget[] }) {
        const id = options?.id || v4();
        const outputDir = options?.outputDir || `${this._client.options.dataDir}/output/scanner-${id}`;
        const targets = options?.targets || ['linux', 'macos', 'win'];

        await mkdir(outputDir, { recursive: true })
        const version = await this.get(name);
        const require = createRequire(import.meta.url);
        const scannerDir = path.join(require.resolve('@envops-cms/scanner'), '../../..');
        const scannerPackageJson = JSON.parse(await readFile(`${scannerDir}/package.json`, { encoding: 'utf-8' }))
        const scannerBin = path.join(scannerDir, scannerPackageJson.bin["envops-cms-scanner"]);

        await mkdir(`${scannerDir}/scanner-${id}`, { recursive: true })

        await Promise.all([
            writeFile(`${scannerDir}/scanner-${id}/scanner.config.json`, JSON.stringify({
                environmentModel: version.model,
                environmentName: this.environmentName,
                environmentVersionName: version.name
            } as ScannerConfig)),
            writeFile(`${scannerDir}/scanner-${id}/pkg.json`, JSON.stringify({
                name: `${outputDir}/scanner-${id}`,
                pkg: {
                    outPath: outputDir,
                    assets: `scanner.config.json`,
                    targets: targets.map(t => `node18-${t}`),
                }
            }))
        ])

        try {
            await exec([scannerBin, '--config', `${scannerDir}/scanner-${id}/pkg.json`])
        } catch (error) {
            throw error;
        } finally {
            await rm(`${scannerDir}/scanner-${id}`, { recursive: true, force: true })
        }

        return outputDir
    }

    async list() {
        return (await readdir(`${this._client.options.dataDir}/data/environments/${this.environmentName}/versions`)).map(versionJsonFile => versionJsonFile.slice(0, versionJsonFile.indexOf('.json')))
    }

    async createHtml(name: string, options?: { outputDir?: string, open?: boolean }) {

        if (options?.outputDir && !path.isAbsolute(options.outputDir)) {
            (options as Required<typeof options>).outputDir = path.join(process.cwd(), options.outputDir)
        }

        const outputDir = options?.outputDir || `${this._client.options.dataDir}/output/${this.environmentName}/${name}/html`;

        await generateHtml({
            outputDir,
            open: options?.open,
            data: {
                modelReport: {
                    environment: await this._client.environments.get(this.environmentName),
                    version: await this.get(name)
                }
            }
        });

        return outputDir;
    }
}