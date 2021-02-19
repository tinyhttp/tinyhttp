import ts from '@rollup/plugin-typescript'
import deps from '../../build/deps'
import { dependencies } from './package.json'

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.js',
      format: 'esm'
    }
  ],
  plugins: [ts()],
  external: [...deps(), ...Object.keys(dependencies)]
}
