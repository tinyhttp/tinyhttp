export default (deps) => [...Object.keys(deps || {}), 'http', 'url', 'path', 'crypto', 'fs', 'fs/promises', 'net']
