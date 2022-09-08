export default (deps: Record<string, string>) => [
  ...Object.keys(deps || {}),
  'http',
  'url',
  'path',
  'crypto',
  'fs',
  'fs/promises',
  'net',
  'events',
  'querystring'
]
