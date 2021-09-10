import cfg from '../../build/cfgBuilder.js'
import { dependencies } from './package.json'

export default cfg({
  external: dependencies
})
