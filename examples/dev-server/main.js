/* eslint-disable @typescript-eslint/no-var-requires */

const { hsr } = require('sosse')

hsr({
  // Used as a prefix to resolve other configuration paths
  base: process.cwd(),
  // Will be called on file changes
  main: () => require('./server')(),
  plugins: [],
})
