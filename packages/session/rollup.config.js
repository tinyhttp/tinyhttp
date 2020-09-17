import cfg from '../../build/cfgBuilder'
import { dependencies } from './package.json'

export default cfg({
  external: dependencies,
})
