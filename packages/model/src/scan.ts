import { EnvironmentModel, isEnvironmentModel } from "./environment-model"

export type ScanStatus = 'pending' | 'complete' | 'error';

export type Scan = {
    id: string,
    environmentName: string,
    environmentVersionName: string,
    environmentModel: EnvironmentModel
    startTime: string,
    endTime: string,
    timeMs: number,
    status: ScanStatus,
    scannedData?: any,
    scannedDataModel?: EnvironmentModel
}

export function isScan(scan: any): scan is Scan {
    const {
        id,
        environmentName,
        environmentModel,
        environmentVersionName,
        scannedData,
        endTime,
        startTime,
        timeMs,
        status,
        scannedDataModel,
        ...rest } = <Scan>scan;
    return typeof id == 'string'
        && typeof environmentName == 'string'
        && typeof environmentVersionName == 'string'
        && typeof endTime == 'string'
        && typeof startTime == 'string'
        && typeof timeMs == 'number'
        && (status == 'complete' || status == 'error' || status == 'pending')
        && isEnvironmentModel(environmentModel)
        && (typeof scannedData == 'object' || scannedData === undefined) //TODO isEnvironmentModelComparison(result)
        && (typeof scannedDataModel == 'object' || scannedDataModel === undefined) //TODO
        && !Object.keys(rest).length;
}