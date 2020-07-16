module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  globals: {
    'ts-jest': {
      packageJson: 'package.json',
    },
  },
}
