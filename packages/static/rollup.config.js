import defaultConfig from '../../build/defaultConfig'
import deps from '../../build/deps'
import { dependencies } from './package.json'

export default { ...defaultConfig, external: deps(dependencies) }
