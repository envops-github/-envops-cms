import { SSHCredentials } from "./environment-model"

export type DataCenterK8S = {
    sshCreds: SSHCredentials,
    namespace: string,
    deployments: Deployment[],
    statefulSets: StatefulSet[]
}

export type Deployment = {
    name: string,
    pods: Pod[],
    versions?: {
        name: string,
        command: string,
        version: string
    }[],
}

export type StatefulSet = {
    name: string,
    pods: Pod[],
    versions?: {
        name: string,
        command: string,
        version: string
    }[]
}

export type Pod = {
    name: string,
    versions?: {
        name: string,
        command: string,
        version: string
    }[]
}