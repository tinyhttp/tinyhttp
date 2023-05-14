import { defineConfig } from 'vite'
import deps from './deps'
import dts from 'vite-plugin-dts'

export const build = (dependencies: Record<string, string>) =>
  defineConfig({
    build: {
      target: 'node16',
      minify: false,
      lib: {
        entry: 'src/index.ts',
        fileName: () => `index.js`,
        formats: ['es']
      },
      rollupOptions: {
        external: deps(dependencies)
      }
    },
    plugins: [dts({ insertTypesEntry: true })]
  })
