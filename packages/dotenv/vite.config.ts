import { build } from '../../config/build'
import pkgJson from './package.json'

export default build(pkgJson['dependencies'])
