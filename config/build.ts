import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import { builtinModules } from 'node:module'

export const build = (dependencies: Record<string, string> = {}) =>
  defineConfig({
    build: {
      target: 'node14.21.3',
      minify: false,
      lib: {
        entry: 'src/index.ts',
        fileName: () => `index.js`,
        formats: ['es']
      },
      ssr: true,
      sourcemap: true
    },
    plugins: [dts({ insertTypesEntry: true })],
    ssr: {
      external: [...Object.keys(dependencies), ...builtinModules]
    }
  })
