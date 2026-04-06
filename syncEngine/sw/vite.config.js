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
    alias: {
      // Hard boundary: block any imports from main-thread modules.
      // If an SW file accidentally imports these, the build will fail
      // with "module not found" instead of silently bundling them.
      '@core': false,
      '@persistence': false,
      '@network': false,
      '@decorators': false,
      '@worker': false,
    },
  },
})
