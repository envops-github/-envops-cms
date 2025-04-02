import { existsSync, mkdirSync } from "fs";
import { EnvopsCmsClient } from "../index";
import { CallableController } from "../callable-controller/index";
import { mkdir, readdir, readFile, rm, writeFile } from "fs/promises";
import { EnvironmentVersionsCallbaleController, EnvironmentVersionsController } from "./versions";
import { OmitTupleFirst } from "@envops-cms/utils";
import { Environment, EnvironmentVersion, isEnvironment, isEnvironmentVersion } from "@envops-cms/model";


export type EnvironmentsCallableController = EnvironmentsController & typeof EnvironmentsController.prototype.callable

export class EnvironmentsController extends CallableController {
    constructor(private _client: EnvopsCmsClient) {
        super();

        if (!existsSync(`${this._client.options.dataDir}/data/environments`)) {
            mkdirSync(`${this._client.options.dataDir}/data/environments`, { recursive: true });
        }
    }

    callable(name: string) {

        if (!existsSync(`${this._client.options.dataDir}/data/environments/${name}/${name}.json`)) {
            throw new Error(`Environment ${name} not found`);
        }

        return {
            get: async () => await this.get(name),
            delete: async () => await this.delete(name),
            modify: async (...params: OmitTupleFirst<Parameters<typeof this.modify>>) => await this.modify(name, ...params),
            versions: new EnvironmentVersionsController(this._client, name) as EnvironmentVersionsCallbaleController
        }
    }

    async get(name: string): Promise<Environment> {

        if (!existsSync(`${this._client.options.dataDir}/data/environments/${name}/${name}.json`)) {
            throw new Error(`Environment ${name} not found`);
        }

        return JSON.parse(await readFile(`${this._client.options.dataDir}/data/environments/${name}/${name}.json`, { encoding: 'utf-8' }))
    }

    async delete(name: string) {
        await rm(`${this._client.options.dataDir}/data/environments/${name}`, { recursive: true, force: true });
        return name;
    }

    async modify(name: string, envConstructor: Partial<Environment>) {
        let env = await this.get(name);
        env = { ...env, ...envConstructor };

        await writeFile(`${this._client.options.dataDir}/data/environments/${name}/${name}.json`, JSON.stringify(env));

        return env;
    }

    async create(envConstructor: Environment & { versions: EnvironmentVersion[] }) {
        const { versions, ...environment } = envConstructor;

        if (existsSync(`${this._client.options.dataDir}/data/environments/${environment.name}`)) {
            throw new Error(`Environment ${envConstructor.name} already exists`);
        }

        if (!isEnvironment(environment)) {
            throw new Error(`Invalid environment constructor: ${JSON.stringify(environment)}`);
        }
        const invalidVersion = versions.find(v => !isEnvironmentVersion(v));
        if (invalidVersion) {
            throw new Error(`Invalid environment version constructor: ${JSON.stringify(invalidVersion)}`);
        }

        if (!versions.some(v => v.name == environment.currentVersionName)) {
            throw new Error(`Environment version not found: ${JSON.stringify(environment.currentVersionName)}`);
        }

        await mkdir(`${this._client.options.dataDir}/data/environments/${environment.name}/versions`, { recursive: true });
        await Promise.all([
            writeFile(`${this._client.options.dataDir}/data/environments/${environment.name}/${environment.name}.json`, JSON.stringify(environment)),
            ...versions.map(v => writeFile(`${this._client.options.dataDir}/data/environments/${environment.name}/versions/${v.name}.json`, JSON.stringify(v)))
        ]);

        return envConstructor;
    }

    async list() {
        return (await readdir(`${this._client.options.dataDir}/data/environments`))
    }
}