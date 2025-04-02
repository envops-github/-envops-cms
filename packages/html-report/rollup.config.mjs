import { globSync } from "glob";
import path from "node:path";
import { fileURLToPath } from "node:url";
import typescript from "@rollup/plugin-typescript";
import commonjs from "@rollup/plugin-commonjs";
function rollupPlugins(options) {
    return [typescript(options?.typescript), commonjs()];
}
const input = Object.fromEntries(globSync("src/generate-html/**/*.@(ts|js|mts|mjs)").map((file) => [
    // This removes `src/` as well as the file extension from each
    // file, so e.g. src/nested/foo.js becomes nested/foo
    path.relative("src/generate-html", file.slice(0, file.length - path.extname(file).length)),
    // This expands the relative paths to absolute paths, so e.g.
    // src/nested/foo becomes /project/src/nested/foo.js
    fileURLToPath(new URL(file, import.meta.url)),
]));
export default [
    {
        input,
        output: [
            {
                dir: "./dist/es/generate-html",
                format: "es",
            },
        ],
        plugins: rollupPlugins({
            typescript: {
                tsconfig: './tsconfig.generate-html.json',
                compilerOptions: {
                    outDir: './dist/es/generate-html',
                    declarationDir: "./dist/es/generate-html",
                }
            }
        }),
    },
    {
        input,
        output: [
            {
                dir: "./dist/cjs/generate-html",
                format: "cjs",
            },
        ],
        plugins: rollupPlugins({
            typescript: {
                tsconfig: './tsconfig.generate-html.json',
                compilerOptions: {
                    outDir: './dist/cjs/generate-html',
                    declarationDir: "./dist/cjs/generate-html",
                }
            }
        }),
    },
];
