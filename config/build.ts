import { defineConfig } from 'vite'
import deps from './deps'

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
    }
  })
