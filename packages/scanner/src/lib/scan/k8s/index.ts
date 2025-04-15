import { DataCenter } from "@envops-cms/model";
import { NodeSSH } from "node-ssh";


export type K8s = {
  deployments: {
    data?: Deployment[],
    error?: string
  },
  statefulSets: {
    data?: StatefulSet[],
    error?: string
  },
  error?: string
}

export type Deployment = {
  type: 'deployment'
  name: string,
  pods: Pod[],
  labelKey: string,
  labelValue: string,
  error?: string
}

export type StatefulSet = {
  type: 'statefulSet'
  name: string,
  pods: Pod[],
  labelKey: string,
  labelValue: string,
  error?: string
}

export type Pod = {
  name: string,
  status?: string
  hostIp?: string
  error?: string,
  versions?: {
    name: string,
    command: string,
    version: string
  }[],
}

type Resource = {
  metadata: {
    name: string;
  };
  spec: {
    selector: {
      matchLabels: {
        app: string
      }
    }
  }
  status: {
    phase: string,
    hostIP?: string
  }
};

type JsonData = {
  items: Resource[];
};

export async function scanDataCenterK8s(dataCenter: DataCenter) {

  let output: K8s = { deployments: {}, statefulSets: {} };

  if (!dataCenter.k8s) {
    return output
  }

  if (!dataCenter.k8s.sshCreds) {
    output.error = "SSH credentials are required.";
    return output
  }

  const ssh = new NodeSSH();

  try {
    await ssh.connect({
      host: dataCenter.k8s.sshCreds.host,
      port: dataCenter.k8s.sshCreds.port,
      username: dataCenter.k8s.sshCreds.username,
      password: dataCenter.k8s.sshCreds.password,
      tryKeyboard: true,
      readyTimeout: 5000,
    });

    output.deployments = await getDeployments(dataCenter, ssh);

    output.statefulSets = await getStatefulSets(dataCenter, ssh);

  } catch (error) {
    output.error = error instanceof Error ? error.message : "Unknown error";
  } finally {
    ssh.dispose();
  }

  return output;

}

async function getDeployments(dataCenter: DataCenter, ssh: NodeSSH) {
  const deploymentsData = await ssh.execCommand(`kubectl get deployments -n ${dataCenter.k8s?.namespace} -o json`);

  let deployments: (K8s["deployments"]) = { data: [] };

  if (deploymentsData.stderr) {
    deployments.error = `Unable to retrieve deployments data from ${dataCenter.k8s?.sshCreds.host}: ${deploymentsData.stderr}`;
    return deployments;
  }

  const parsedDeployment: JsonData = JSON.parse(deploymentsData.stdout);

  for (const set of parsedDeployment.items) {
    const [labelKey, labelValue] = Object.entries(set.spec.selector.matchLabels)[0];
    let output = {
      type: 'deployment',
      name: set.metadata.name,
      labelKey,
      labelValue,
      pods: []
    } as Deployment;

    try {
      output = await getPods(output, dataCenter, ssh) as Deployment
    } catch (error) {
      output.error = (error as Error)?.message || "Unknown Error"
    }
    deployments.data?.push(output)
  }

  return deployments;

}

async function getStatefulSets(dataCenter: DataCenter, ssh: NodeSSH) {

  const statefulSetsData = await ssh.execCommand(`kubectl get statefulsets -n ${dataCenter.k8s?.namespace} -o json`);

  let statefulSets: (K8s["statefulSets"]) = { data: [] };

  if (statefulSetsData.stderr) {
    statefulSets.error = `Unable to retrieve statedulsets data from ${dataCenter.k8s?.sshCreds.host}: ${statefulSetsData.stderr}`;
    return statefulSets
  }

  const parsedStatedulSets: JsonData = JSON.parse(statefulSetsData.stdout);

  for (const set of parsedStatedulSets.items) {
    const [labelKey, labelValue] = Object.entries(set.spec.selector.matchLabels)[0];
    let output = {
      type: 'statefulSet',
      name: set.metadata.name,
      labelKey,
      labelValue,
      pods: []
    } as StatefulSet;

    try {
      output = await getPods(output, dataCenter, ssh) as StatefulSet
    } catch (error) {
      output.error = (error as Error)?.message || "Unknown Error"
    }
    statefulSets.data?.push(output)
  }
  return statefulSets;
}

async function getPods(resourceData: Deployment | StatefulSet, dataCenter: DataCenter, ssh: NodeSSH) {

  const getPodData = await ssh.execCommand(`kubectl get pods -n ${dataCenter.k8s?.namespace} --selector=${resourceData.labelKey}=${resourceData.labelValue} -o json`);

  if (getPodData.stderr) {
    resourceData.error = `Unable to retrieve pod data from ${resourceData.name}: ${getPodData.stderr}`;
    return resourceData;
  }

  const pods = JSON.parse(getPodData.stdout).items as Resource[];

  const sourceResource = dataCenter.k8s?.[`${resourceData.type}s`]?.find(r => r.name == resourceData.name);

  for (const pod of pods) {
    const podVersions = sourceResource?.pods?.find((d) => d.name == pod.metadata.name)?.versions || [];

    const versions = [...(sourceResource?.versions || []), ...podVersions]

    resourceData.pods.push({
      name: pod.metadata.name,
      hostIp: pod.status.hostIP,
      status: pod.status.phase,
      versions: await scanPod(versions, pod.metadata.name, dataCenter, ssh)
    })
  }

  return resourceData;
}

async function scanPod(versions: { command: string, name: string }[], podName: string, dataCenter: DataCenter, ssh: NodeSSH) {

  let output = [];

  for (const version of versions) {
    const result = await ssh.execCommand(`kubectl exec ${podName}  -n ${dataCenter.k8s?.namespace} -- csh -c "${version.command}"`);
    console.log(result.stdout, version.command, podName)
    output.push({
      name: version.name,
      command: version.command,
      version: result.stdout
    })
  }

  return output
}
