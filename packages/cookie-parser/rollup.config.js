import defaultConfig from '../../build/defaultConfig'
import { dependencies } from './package.json'
import deps from '../../build/deps'

export default {
  ...defaultConfig,
  external: deps(dependencies),
}
