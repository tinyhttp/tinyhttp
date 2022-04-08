import ts from '@rollup/plugin-typescript'
import deps from './deps'

export default {
  input: 'src/index.ts',
  output: [
    {
      dir: 'dist',
      format: 'esm'
    }
  ],
  plugins: [ts()],
  external: deps()
}
