import { readdir } from 'node:fs/promises'
import path from 'node:path'
import { defineConfig } from 'vitest/config'

const relative = (relativePath: string) => {
  return path.resolve(import.meta.dirname, relativePath)
}

// Tests that leak global state (module mocks, process.env, fake timers) and need their own worker
const isolated = [
  'tests/core/request.test.ts',
  'tests/modules/dotenv.test.ts',
  'tests/wares/rate-limit/memory-store.test.ts'
]

export default defineConfig({
  test: {
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['lcov', 'html'],
      include: ['packages/*/src/**']
    },
    projects: [
      { extends: true, test: { name: 'isolated', include: isolated, isolate: true } },
      { extends: true, test: { name: 'shared', include: ['tests/**/*.test.ts'], exclude: isolated, isolate: false } }
    ]
  },
  resolve: {
    alias: Object.fromEntries(
      (await readdir(relative('packages'))).map((pkg) => [`@tinyhttp/${pkg}`, relative(`packages/${pkg}/src`)])
    )
  }
})
