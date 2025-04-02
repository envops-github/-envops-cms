import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "fs";
import { Scanner, type ScannerConfig } from "../index";
import path from "path";

async function main() {

    // @ts-expect-error when compiled to binary pkg adds a
    // prop to the process object which is available at runtime,
    // its a reliable check if is executable.
    const IS_EXE = process.pkg !== undefined

    const args = process.argv.slice(2);

    const outputFlagIndex = args.findIndex(i => i == '-o' || i == '--output-path');
    const configFlagIndex = args.findIndex(i => i == '-c' || i == '--config-path');

    let outputPath = '.';
    let configPath = './scanner.config.json';

    if (IS_EXE) {
        configPath = path.join(__dirname, '../../..', readdirSync(path.join(__dirname, '../../..'))[1], 'scanner.config.json');
    }

    if (outputFlagIndex !== -1) {
        const outputPathArg = args[outputFlagIndex + 1];
        if (!outputPathArg) {
            throw new Error("Invalid output path arg");
        }
        outputPath = outputPathArg;
    }

    if (configFlagIndex !== -1) {
        const configPathArg = args[configFlagIndex + 1];
        if (!configPathArg) {
            throw new Error("Invalid config path arg");
        }
        configPath = configPathArg;
    }

    if (!existsSync(configPath)) {
        throw new Error(`Scanner config not found, path: ${configPath}`);
    }

    const scannerConfig = JSON.parse(readFileSync(configPath, { encoding: 'utf-8' })) as ScannerConfig;
    const scanner = new Scanner(scannerConfig);

    const result = await scanner.scan();

    if (!existsSync(outputPath)) {
        mkdirSync(outputPath, { recursive: true })
    }
    writeFileSync(`${outputPath}/scan-${result.id}.json`, JSON.stringify(result));

    console.log(`scan result: ${outputPath}/scan-${result.id}.json`)
}

main();