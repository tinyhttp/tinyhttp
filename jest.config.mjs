export default {
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
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
  modulePathIgnorePatterns: ['tests/wares/rate-limit/rate-limit.test.ts', 'uvu_tests', 'examples', 'site']
}
