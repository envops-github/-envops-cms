import { test, expect } from 'vitest';
import { EnvopsCmsClient } from '../src/index'
import { isScan } from '@envops-cms/model';
import { v4 } from 'uuid';
import { ScannerTarget } from '../src/controllers/versions';
import { readdir } from 'fs/promises';
import { execSync } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';


const client = new EnvopsCmsClient();

test("create environment", async (t) => {

    const env = await client.environments.create(
        {
            name: "test-env",
            currentVersionName: "test-version",
            versions: [
                {
                    name: "test-version",
                    model: {
                        dataCenters: [
                            // {
                            //     name: 'RefDragon',
                            //     vApps: [{
                            //         name: 'VAPP-TS4-REF-SEE',
                            //         vms: [
                            //             {
                            //                 hostname: "ts4see01refsc001",
                            //                 osType: "sles12_64Guest",
                            //                 hardwareVersion: "vmx-11",
                            //                 vmToolsVersion: "10358",
                            //                 cpuCores: 12,
                            //                 memoryGb: 48,
                            //                 nics: [
                            //                     {
                            //                         name: "TS4-CP_PEDT_3354_VCCS_SERVICE_PLANE",
                            //                         mac: "00:50:56:01:14:5c",
                            //                         ipv4Address: "192.168.97.4",
                            //                         ipv6Address: null,
                            //                         ipType: "IPV_4",
                            //                         adapterType: "VMXNET3",
                            //                         connectionIndex: 1
                            //                     },
                            //                     {
                            //                         name: " TS4-CP_EXT_3355_VCCS_OUM",
                            //                         mac: "00:50:56:01:14:5b",
                            //                         ipv4Address: "10.217.86.121",
                            //                         ipv6Address: null,
                            //                         ipType: "IPV_4",
                            //                         adapterType: "VMXNET3",
                            //                         connectionIndex: 0
                            //                     }
                            //                 ],
                            //                 disks: [
                            //                     {
                            //                         storageProfile: "TS4-ETC-CP-vCloud-Resource-DSC01-Cluster-Profile-TAC",
                            //                         sizeGb: 50,
                            //                         busNumber: 0
                            //                     }

                            //                 ],
                            //                 versions: [{
                            //                     command: "su - see -c 'ocg_version.sh'",
                            //                     name: "Online Mediation(OCG)",
                            //                     version: "V500R021C01CP0007"
                            //                 }, {
                            //                     command: "su - see -c 'version.sh'",
                            //                     name: "ONIP SNE",
                            //                     version: "V300R003C07SPC107"
                            //                 }],
                            //                 sshCreds: {
                            //                     host: "10.217.86.121",
                            //                     password: "Changeme_123",
                            //                     username: "root"
                            //                 }
                            //             }

                            //         ],
                            //         versions: [{
                            //             command: "cat /etc/SuSE-release",
                            //             name: "OS",
                            //             version: "SUSE 12"
                            //         }]
                            //     }],
                            //     storagePolicies: [{ name: "test", default: true, limitGb: 0, usedGb: 46 }],
                            //     apiUrl: 'https://vcloud.dmz.vblock1.mvtc.vodafone.de/api/',
                            //     networks: [],
                            //     org: 'org-huawei-vccs',

                            //     providerName: 'vCloud',
                            //     vdcName: 'OVDC-TS4-HUAWEI-VCCS-REF',
                            //     apiUsername: 'dzegelman',
                            //     apiVersion: '36.3',
                            //     apiPassword: 'wIeJdUqXzOU2a7#YfDi8',
                            //     k8s: {
                            //         sshCreds: {
                            //             host: "10.217.86.174",
                            //             password: "Changeme_123",
                            //             port: 22,
                            //             username: "root"
                            //         },
                            //         statefulSets: [{
                            //             name: "cbpmdb-1-1-m",
                            //             pods: [{ name: "cbpmdb-1-1-m-0" }, { name: "cbpmdb-1-1-m-1" }],

                            //         }],
                            //         deployments: [{
                            //             name: "bmapp-1",
                            //             pods: [{
                            //                 name: "bmapp-1-54c76d5f9c-77q7l",
                            //                 versions: [{
                            //                     "name": "DigitalWare OpenAS",
                            //                     "version": "V600R002C08SPC005 OpenAS",
                            //                     "command": "version.sh | sed -n '2p'",

                            //                 }, {
                            //                     "name": "PowerCOM USM",
                            //                     "version": "V100R002C16SPC003(64-bit)",
                            //                     "command": "sed -n 3p /home/bmpapp/tomcat/webapps/default.war/srv_config/version/version_usm.xml",
                            //                 }, {
                            //                     "name": "Huawei JDK",
                            //                     "version": "2.0.0.311.B003",
                            //                     "command": "java -version",
                            //                 },
                            //                 {
                            //                     "name": "Docker Version",
                            //                     "version": "V500R021C00LDE212SPC200",
                            //                     "command": "/home/bmpapp/tools/version/gv.sh",
                            //                 }, {
                            //                     "name": "CBS",
                            //                     "version": "V500R021C00LDE212SPC200",
                            //                     "command": "/home/bmpapp/tools/version/gv.sh",
                            //                 }]

                            //             }, {
                            //                 name: "bmapp-1-54c76d5f9c-9968m",
                            //                 versions: [{
                            //                     "name": "DigitalWare OpenAS",
                            //                     "version": "V600R002C08SPC005 OpenAS",
                            //                     "command": "version.sh",

                            //                 }, {
                            //                     "name": "PowerCOM USM",
                            //                     "version": "V100R002C16SPC003(64-bit)",
                            //                     "command": "sed -n 3p /home/bmpapp/tomcat/webapps/default.war/srv_config/version/version_usm.xml",
                            //                 }, {
                            //                     "name": "Huawei JDK",
                            //                     "version": "2.0.0.311.B003",
                            //                     "command": "java -version",
                            //                 },
                            //                 {
                            //                     "name": "Docker Version",
                            //                     "version": "V500R021C00LDE212SPC200",
                            //                     "command": "/home/bmpapp/tools/version/gv.sh",
                            //                 }, {
                            //                     "name": "CBS",
                            //                     "version": "V500R021C00LDE212SPC200",
                            //                     "command": "/home/bmpapp/tools/version/gv.sh",
                            //                 }]
                            //             },
                            //             {
                            //                 name: "bmapp-1-54c76d5f9c-bxj8t",
                            //                 versions: [{
                            //                     "name": "DigitalWare OpenAS",
                            //                     "version": "V600R002C08SPC005 OpenAS",
                            //                     "command": "version.sh",

                            //                 }, {
                            //                     "name": "PowerCOM USM",
                            //                     "version": "V100R002C16SPC003(64-bit)",
                            //                     "command": "sed -n 3p /home/bmpapp/tomcat/webapps/default.war/srv_config/version/version_usm.xml",
                            //                 }, {
                            //                     "name": "Huawei JDK",
                            //                     "version": "2.0.0.311.B003",
                            //                     "command": "java -version",
                            //                 },
                            //                 {
                            //                     "name": "Docker Version",
                            //                     "version": "V500R021C00LDE212SPC200",
                            //                     "command": "/home/bmpapp/tools/version/gv.sh",
                            //                 }, {
                            //                     "name": "CBS",
                            //                     "version": "V500R021C00LDE212SPC200",
                            //                     "command": "/home/bmpapp/tools/version/gv.sh",
                            //                 }]
                            //             },
                            //             {
                            //                 name: "bmapp-1-54c76d5f9c-vzxnt",
                            //                 versions: [{
                            //                     "name": "DigitalWare OpenAS",
                            //                     "version": "V600R002C08SPC005 OpenAS",
                            //                     "command": "version.sh",

                            //                 }, {
                            //                     "name": "PowerCOM USM",
                            //                     "version": "V100R002C16SPC003(64-bit)",
                            //                     "command": "sed -n 3p /home/bmpapp/tomcat/webapps/default.war/srv_config/version/version_usm.xml",
                            //                 }, {
                            //                     "name": "Huawei JDK",
                            //                     "version": "2.0.0.311.B003",
                            //                     "command": "java -version",
                            //                 },
                            //                 {
                            //                     "name": "Docker Version",
                            //                     "version": "V500R021C00LDE212SPC200",
                            //                     "command": "/home/bmpapp/tools/version/gv.sh",
                            //                 }, {
                            //                     "name": "CBS",
                            //                     "version": "V500R021C00LDE212SPC200",
                            //                     "command": "/home/bmpapp/tools/version/gv.sh",
                            //                 }]
                            //             }],

                            //         }],
                            //         namespace: "ns000000000000000000001"
                            //     }
                            // },
                            {
                                name: 'Taishan',
                                providerName: 'BareMetal',
                                bareMetalsshCreds: [{
                                    host: "10.216.82.178",
                                    password: "Changeme_123",
                                    port: 22,
                                    username: "root"
                                },
                                {
                                    host: "10.216.82.179",
                                    password: "Changeme_123",
                                    port: 22,
                                    username: "root"
                                },
                                {
                                    host: "10.216.82.180",
                                    password: "Changeme_123",
                                    port: 22,
                                    username: "root"
                                },
                                {
                                    host: "10.216.82.181",
                                    password: "Changeme_me123",
                                    port: 22,
                                    username: "root"
                                },
                                {
                                    host: "10.216.82.183",
                                    password: "Changeme_me123",
                                    port: 22,
                                    username: "root"
                                },
                                {
                                    host: "10.216.82.184",
                                    password: "Changeme_123",
                                    port: 22,
                                    username: "root"
                                },
                                {
                                    host: "10.216.82.185",
                                    password: "Changeme_123",
                                    port: 22,
                                    username: "root"
                                }, {
                                    host: "10.216.82.186",
                                    password: "Changeme_123",
                                    port: 22,
                                    username: "root"
                                }]
                            }
                        ], 
                    },
                    createdAt: new Date().toISOString()
                }
            ]
        }
    );
    expect(env).toBeTruthy()
})

test("get environment", async (t) => {
    const env = await client.environments('test-env').get();

    console.log(env)

    expect(env).toBeTruthy()
})

test("create environment version", async (t) => {
    const version = await client.environments('test-env').versions.create({ name: 'test-version-2', model: { dataCenters: [] } }, { setCurrent: true });

    const env = await client.environments('test-env').get();

    expect(env.currentVersionName).toBe('test-version-2')
})

test("list environment versions", async (t) => {
    const versionList = await client.environments('test-env').versions.list();

    console.log(versionList)

    expect(versionList).toBeInstanceOf(Array)
    versionList.map(versionName => expect(versionName).toBeTypeOf('string'))
})

test("modify environment", async (t) => {
    await client.environments('test-env').modify({ currentVersionName: 'test-version' });

    const env = await client.environments('test-env').get();

    expect(env.currentVersionName).toBe('test-version')
})

test("get environment version", async (t) => {
    const version = await client.environments('test-env').versions('test-version-2').get();

    expect(version).toBeTruthy()
})

test("create environment version html", async (t) => {
    const outputDir = `.envops-cms/output/test-version/test-version-2/html`;
    await client.environments('test-env').versions('test-version').createHtml({ outputDir, open: true });

    expect(existsSync(path.join(outputDir, 'index.html'))).toBe(true);
})

test("list environments", async (t) => {
    const envList = await client.environments.list();

    console.log(envList)

    expect(envList).toBeInstanceOf(Array)
    envList.map(envName => expect(envName).toBeTypeOf('string'))
})

test("scan environment version", async (t) => {
    const result = await client.environments('test-env').versions('test-version').scan();

    console.log(result.scannedDataModel?.dataCenters)

    expect(isScan(result)).toBe(true);
}, 60000)

const scannerId = v4();

test("create environment version scanner", async (t) => {
    const outputDir = `.envops-cms/output/scanner-${scannerId}`;
    const targets: ScannerTarget[] = ['linux', 'win', 'macos'];

    await client.environments('test-env').versions('test-version').createScanner({ id: scannerId, outputDir, targets });

    const executables = await readdir(outputDir);
    console.log(executables)
    expect(executables.some(e => e == `scanner-${scannerId}-linux`)).toBe(true)
    expect(executables.some(e => e == `scanner-${scannerId}-win.exe`)).toBe(true)
    expect(executables.some(e => e == `scanner-${scannerId}-macos`)).toBe(true)
}, 15000)

let scanId: string | undefined;

// test("run scanner", async (t) => {
//     const output = execSync(`.envops-cms/output/scanner-${scannerId}/scanner-${scannerId}-linux --output-path .envops-cms/output/scans`, { encoding: 'utf-8' });
//     console.log(output)
//     scanId = output.match(/scan result: .envops-cms\/output\/scans\/scan-(.*).json/)?.[1];
//     expect(scanId).toBeTypeOf('string');
// })
// 
// test("import scan", async (t) => {
//     await client.scans.import(`.envops-cms/output/scans/scan-${scanId}.json`)
// })

test("list scans", async (t) => {
    const scans = await client.scans.list();

    console.log(scans)

    expect(scans).toBeInstanceOf(Array)
    scans.map(scanId => expect(scanId).toBeTypeOf('string'))
})

test("delete environment", async (t) => {
    const envName = await client.environments('test-env').delete();
    expect(envName).toBe('test-env')
})

