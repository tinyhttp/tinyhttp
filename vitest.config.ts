import { readdir } from 'node:fs/promises'
import path from 'node:path'
import { defineConfig } from 'vitest/config'

const relative = (relativePath: string) => {
  return path.resolve(import.meta.dirname, relativePath)
}

export default defineConfig({
  test: {
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['lcov'],
      include: ['packages/*/src']
    }
  },
  resolve: {
    alias: Object.fromEntries(
      (await readdir(relative('packages'))).map((pkg) => [`@tinyhttp/${pkg}`, relative(`packages/${pkg}/src`)])
    )
  }
})
