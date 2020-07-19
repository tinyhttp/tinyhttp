import ts from 'rollup-plugin-typescript2'
import filesize from 'rollup-plugin-filesize'
import closure from '@ampproject/rollup-plugin-closure-compiler'

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
    closure({
      compilationLevel: 'WHITESPACE_ONLY',
    }),
    filesize(),
  ],
}
