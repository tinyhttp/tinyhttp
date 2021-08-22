export default {
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  collectCoverage: true,
  collectCoverageFrom: ['packages/**/src/*.{js,ts}', '!/node_modules/', '!examples/*.{js,ts}'],
  preset: 'ts-jest/presets/default-esm',
  globals: {
    'ts-jest': {
      useESM: true
    }
  },
  transform: {
    '^.+\\.(t|j)sx?$': 'ts-jest'
  },
  testRegex: '(/tests/.*|\\.(test))\\.(ts|tsx|js)$',
  moduleFileExtensions: ['ts', 'js', 'json'],
  resolver: './resolver.cjs',
  modulePathIgnorePatterns: ['tests/wares/rate-limit/rate-limit.test.ts', 'examples']
}
