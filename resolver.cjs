/* eslint-disable @typescript-eslint/no-var-requires */
const { create } = require('enhanced-resolve')
const { builtinModules } = require('module')

const resolver = create.sync({
  conditionNames: ['require', 'node', 'default', 'import'],
  extensions: ['.js', '.json', '.node', '.ts']
})

module.exports = function (request, options) {
  if (builtinModules.includes(request)) return request
  return resolver(options.basedir, request)
}
