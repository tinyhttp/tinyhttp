import cfg from '../../build/cfgBuilder.js'
import deps from '../../build/deps'
import { dependencies } from './package.json'

export default cfg({
  external: deps(dependencies)
})
