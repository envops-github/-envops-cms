import { EnvironmentModel, isEnvironmentModel } from "./environment-model";

export type Environment = {
    name: string,
    currentVersionName: string,
}

export type EnvironmentVersion = {
    name: string,
    model: EnvironmentModel,
    createdAt: string
}

export function isEnvironment(env: any): env is Environment {
    const { name, currentVersionName, ...rest } = <Environment>env;
    return typeof name == 'string'
        && typeof currentVersionName == 'string'
        && !Object.keys(rest).length;
}

export function isEnvironmentVersion(envVersion: any): envVersion is EnvironmentVersion {
    const { name, model, createdAt, ...rest } = <EnvironmentVersion>envVersion;
    return typeof name == 'string'
        && typeof createdAt == 'string'
        && isEnvironmentModel(model)
        && !Object.keys(rest).length;
}