import { writeFileSync } from "node:fs";
import { ModelReportData } from "./src/main";

const modelReport: ModelReportData = {
    environment: {
        currentVersionName: 'test-version',
        name: 'test-env'
    },
    version: {
        name: 'test-version',
        createdAt: new Date().toISOString(),
        model: {
            dataCenters: [{
                name: 'TS4',
                storage: { policies: [] },
                vApps: [{
                    name: 'OMDB',
                    vms: [
                        {
                            hostname: 'ts4-omdb-1',
                            cpuCores: 8,
                            cpuSpeedGhz: 3.7,
                            memoryGb: 16
                        }
                    ],
                    networks: []
                }],
                apiUrl: 'https://ts4-demo-url.com',
                networks: [{
                    name: "TS4-EXT-3355-vCCS_OUM",
                    gatewayIpv4: "10.217.94.1",
                    subnetIpv4: "255.255.254.0",
                    gatewayIpv6: "",
                    subnetIpv6: "",
                }],
                org: 'huawei-vccs',
                apiPassword: '',
                apiVersion: '36.3',
                providerName: 'vCloud',
                vdcName: 'TS4',
                apiUsername: ''
            },
            {
                name: 'TS5',
                vApps: [{
                    name: 'OMDB',
                    vms: [
                        {
                            hostname: 'ts5-omdb-1',
                            cpuCores: 8,
                            cpuSpeedGhz: 3.7,
                            memoryGb: 16
                        }
                    ],
                    networks: []
                }],
                apiUrl: 'https://ts5-demo-url.com',
                networks: [],
                storage: { policies: [] },
                org: 'huawei-vccs',
                apiPassword: '',
                providerName: 'vCloud',
                apiVersion: '36.3',
                vdcName: 'TS5',
                apiUsername: ''
            }],
        },
    }
}

if (process.argv[2] === 'export') {
    writeFileSync(process.argv[3] || "./dev-model.json", JSON.stringify(modelReport));
}

export default modelReport;