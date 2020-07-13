import defaultConfig from '../../build/defaultConfig'
import deps from '../../build/deps'

export default { ...defaultConfig, external: deps() }
