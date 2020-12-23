import ts from 'rollup-plugin-typescript2'
import deps from '../../build/deps'

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.js',
      format: 'esm'
    }
  ],
  plugins: [ts()],
  external: deps()
}
