import { existsSync, mkdirSync } from "fs";
import { EnvironmentsCallableController, EnvironmentsController } from "./controllers/environments";
import { ScansCallableController, ScansController } from "./controllers/scans";
import { OmitTupleFirst } from "@envops-cms/utils";
import path from "path";
import { compareModelsController } from "./controllers/compare";

export type EnvopsCMSClientOptions = {
    dataDir?: string,
    autoInit?: boolean
}

export const DEFAULT_CMS_CLIENT_OPTIONS: EnvopsCMSClientOptions = {
    dataDir: path.join(process.cwd(), `.envops-cms`),
    autoInit: true
}

export class EnvopsCmsClient {
    readonly environments: EnvironmentsCallableController;
    readonly scans: ScansCallableController;
    readonly compare: (...params: OmitTupleFirst<Parameters<typeof compareModelsController>>) => ReturnType<typeof compareModelsController>;

    constructor(private _options: EnvopsCMSClientOptions = DEFAULT_CMS_CLIENT_OPTIONS) {

        if (_options.autoInit !== false) {
            this.init(this._options);
        }

        this.environments = new EnvironmentsController(this) as EnvironmentsCallableController;
        this.scans = new ScansController(this) as ScansCallableController;
        this.compare = (...params) => compareModelsController(this, ...params);
    }

    get options() {
        return this._options;
    }

    init(options?: EnvopsCMSClientOptions) {
        this._options = { ...DEFAULT_CMS_CLIENT_OPTIONS, ...options };

        if (this.options.dataDir && !path.isAbsolute(this.options.dataDir)) {
            this._options.dataDir = path.join(process.cwd(), this.options.dataDir);
        }

        if (!existsSync(`${this.options.dataDir}`)) {
            mkdirSync(`${this.options.dataDir}`)
        }
    }
}