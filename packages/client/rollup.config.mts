import { globSync } from "glob";
import path from "node:path";
import { fileURLToPath } from "node:url";
import typescript, { type RollupTypescriptOptions } from "@rollup/plugin-typescript";
import { type RollupOptions } from 'rollup'
import commonjs from '@rollup/plugin-commonjs';

function rollupPlugins(options?: { typescript?: RollupTypescriptOptions }) {
  return [
    typescript(options?.typescript), commonjs()];
}

const input = Object.fromEntries(
  globSync("src/**/*.@(ts|js)").map((file) => [
    // This removes `src/` as well as the file extension from each
    // file, so e.g. src/nested/foo.js becomes nested/foo
    path.relative(
      "src",
      file.slice(0, file.length - path.extname(file).length)
    ),
    // This expands the relative paths to absolute paths, so e.g.
    // src/nested/foo becomes /project/src/nested/foo.js
    fileURLToPath(new URL(file, import.meta.url)),
  ])
);


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
        outDir: "./dist/es",
        rootDir: "./src",
        declarationDir: "./dist/es",
        esModuleInterop: true,
        declaration: true,
        declarationMap: true
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
        outDir: "./dist/cjs",
        rootDir: "./src",
        declarationDir: "./dist/cjs",
        esModuleInterop: true,
        declaration: true,
        declarationMap: true,
      }
    }),
  },
] as RollupOptions[];
