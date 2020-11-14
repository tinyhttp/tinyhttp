module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  collectCoverageFrom: ['packages/**/src/*.{js,ts}', '!/node_modules/', '!examples/*.{js,ts}'],
  modulePathIgnorePatterns: ['examples', '/node_modules/'],
}
