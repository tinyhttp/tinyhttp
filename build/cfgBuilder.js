import ts from 'rollup-plugin-typescript2'
import deps from './deps'

export default (cfg) => ({
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
  plugins: [ts(), ...(cfg.plugins || [])],
  external: [...deps(cfg.external)],
})
