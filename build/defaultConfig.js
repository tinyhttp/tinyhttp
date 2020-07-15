import ts from 'rollup-plugin-typescript2'
import { terser } from 'rollup-plugin-terser'

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.cjs',
      format: 'cjs',
    },
    {
      file: 'dist/index.js',
      format: 'esm',
    },
  ],
  plugins: [
    ts(),
    terser({
      warnings: 'verbose',
      mangle: {
        toplevel: true,
        keep_fnames: true,
        keep_classnames: true,
        properties: true,
      },
      compress: {
        toplevel: true,
        dead_code: true,
        sequences: false,
        conditionals: false,
        properties: false,
      },
    }),
  ],
}
