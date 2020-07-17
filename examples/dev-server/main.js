/* eslint-disable @typescript-eslint/no-var-requires */

const { hsr, clientPlugin } = require('sosse')
const server = require('./server')

hsr({
  // Used as a prefix to resolve other configuration paths
  base: process.cwd(),
  // Will be called on file changes
  main: () => server(),
  plugins: [clientPlugin()],
})
