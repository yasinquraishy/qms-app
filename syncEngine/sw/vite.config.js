import { defineConfig } from 'vite'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.js'),
      formats: ['es'],
      fileName: 'sync-worker',
    },
    outDir: path.resolve(__dirname, '../../public'),
    emptyOutDir: false, // don't wipe public/ — other static assets live there
  },
  resolve: {
    alias: [
      // Resolve @syncEngine/* so SW files can use canonical alias imports
      // instead of fragile relative paths.
      {
        find: '@syncEngine',
        replacement: path.resolve(__dirname, '..'),
      },
      // Hard boundary: block any imports from main-thread modules.
      // If an SW file accidentally imports these, the build will fail
      // with "module not found" instead of silently bundling them.
      { find: '@core', replacement: path.resolve(__dirname, '__blocked__/@core') },
      { find: '@persistence', replacement: path.resolve(__dirname, '__blocked__/@persistence') },
      { find: '@network', replacement: path.resolve(__dirname, '__blocked__/@network') },
      { find: '@decorators', replacement: path.resolve(__dirname, '__blocked__/@decorators') },
      { find: '@worker', replacement: path.resolve(__dirname, '__blocked__/@worker') },
    ],
  },
})
