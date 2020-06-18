import terser from 'rollup-plugin-terser'
import ts from '@rollup/plugin-typescript'

export default {
  output: {
    dir: 'dist',
    format: 'cjs'
  },
  plugiins: [ts(), terser]
}
