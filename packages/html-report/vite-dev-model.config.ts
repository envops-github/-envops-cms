import { defineConfig } from 'vite'
import { svelte, vitePreprocess } from '@sveltejs/vite-plugin-svelte'
import { viteSingleFile } from 'vite-plugin-singlefile'
import tailwindcss from '@tailwindcss/vite'
import modelReport from './dev-model'

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte({
    preprocess: vitePreprocess()
  }), tailwindcss(), viteSingleFile()],
  root: '.',
  define: {
    injectedData: {
      modelReport
    }
  }
})
