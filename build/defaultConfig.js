import ts from 'rollup-plugin-typescript2'
// import { terser } from 'rollup-plugin-terser'

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
    /*     terser({
      keep_classnames: true,
      keep_fnames: true,
      ecma: 2019,
    }), */
  ],
}
