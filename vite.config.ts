/// <reference types="vitest" />

import { defineConfig } from 'vite'

process.env = { ...process.env, CI: 'true', TESTING: 'true' }

export default defineConfig({
  test: {
    environment: 'node',
    coverage: {
      provider: 'c8',
      reporter: ['lcov'],
      exclude: ['packages/*/dist', 'tests/**/*.test.ts'],
      lines: 95,
      functions: 95,
      branches: 95,
      statements: 95
    }
  }
})
