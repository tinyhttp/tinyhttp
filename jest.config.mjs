export default {
  testEnvironment: 'node',
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
  moduleFileExtensions: ['ts', 'js', 'json']
}
