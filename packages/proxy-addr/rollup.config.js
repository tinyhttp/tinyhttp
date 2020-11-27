import cfg from '../../build/cfgBuilder'
import deps from '../../build/deps'
import { dependencies } from './package.json'

export default cfg({
  external: deps(dependencies)
})
