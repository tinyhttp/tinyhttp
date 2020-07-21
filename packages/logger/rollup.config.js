import defaultConfig from '../../build/defaultConfig'
import deps from '../../build/deps'
import { dependencies } from './package.json'
import ts from 'rollup-plugin-typescript2'

export default { ...defaultConfig, plugins: [ts()], external: deps(dependencies) }
