import { globSync } from "glob";
import path from "node:path";
import { fileURLToPath } from "node:url";
import typescript from "@rollup/plugin-typescript";
function rollupPlugins(options) {
    return [typescript(options?.typescript)];
}
const input = Object.fromEntries(globSync("src/**/*.@(ts|js)").map((file) => [
    // This removes `src/` as well as the file extension from each
    // file, so e.g. src/nested/foo.js becomes nested/foo
    path.relative("src", file.slice(0, file.length - path.extname(file).length)),
    // This expands the relative paths to absolute paths, so e.g.
    // src/nested/foo becomes /project/src/nested/foo.js
    fileURLToPath(new URL(file, import.meta.url)),
]));
export default [
    {
        input,
        output: [
            {
                dir: "./dist/es",
                format: "es",
            },
        ],
        plugins: rollupPlugins({
            typescript: {
                rootDir: "./src",
                outDir: "./dist/es",
                declarationDir: "./dist/es",
                declaration: true,
                declarationMap: true,
                esModuleInterop: true
            }
        }),
    },
    {
        input,
        output: [
            {
                dir: "./dist/cjs",
                format: "cjs",
            },
        ],
        plugins: rollupPlugins({
            typescript: {
                rootDir: "./src",
                outDir: "./dist/cjs",
                declarationDir: "./dist/cjs",
                esModuleInterop: true,
                declaration: true,
                declarationMap: true,
            }
        }),
    },
];
