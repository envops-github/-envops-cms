
import path from "path";
import {fileURLToPath} from "url";
import open from "open";
import { v4 } from "uuid";
import { build, defineConfig } from "vite";
import { svelte, vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { viteSingleFile } from "vite-plugin-singlefile";
import tailwindcss from "@tailwindcss/vite";


export async function generateHtml(options?: {
    outputDir?: string,
    open?: boolean,
    data?: any,
}) {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    //const id = v4() + new Date().toISOString();
    const outputDir = options?.outputDir || './html-report'
    const openBrowser = options?.open;

    const viteConfig = defineConfig({
        plugins: [
            svelte({
                preprocess: vitePreprocess(),
            }),
            tailwindcss(),
            viteSingleFile()
        ],
        root: path.join(__dirname, '../../..'),
        build: {
            outDir: outputDir,
        },
        define: { injectedData: options?.data },
    })

    await build(viteConfig);

    if (openBrowser) {
        await open(path.join(outputDir, 'index.html'));
    }
}