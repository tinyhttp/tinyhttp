import defaultConfig from '../../build/defaultConfig'
import deps from '../../build/deps.js'

export default { ...defaultConfig, external: deps() }
