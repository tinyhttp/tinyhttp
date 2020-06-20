import { terser } from 'rollup-plugin-terser'
import auto from 'rollup-plugin-auto-external'
import ts from '@wessberg/rollup-plugin-ts'
import fs from 'fs'

let cfg = []

const pkgsList = fs.readdirSync('packages').sort()

for (let pkg of pkgsList) {
  const pkgJson = JSON.parse(fs.readFileSync(`${__dirname}/packages/${pkg}/package.json`).toString())

  const deps = pkgJson.dependencies ? Object.keys(pkgJson.dependencies) : []

  const defaultCfg = {
    input: `packages/${pkg}/src/index.ts`,

    external: deps
  }

  cfg.push({
    ...defaultCfg,
    output: {
      file: `packages/${pkg}/dist/index.js`,
      format: 'cjs'
    },
    plugins: [auto(), ts(), terser()]
  })

  cfg.push({
    ...defaultCfg,
    output: {
      file: `packages/${pkg}/dist/index.esm.js`,
      format: 'es'
    },
    plugins: [
      auto(),
      ts({
        transpileOnly: true
      }),

      terser()
    ]
  })
}

export default cfg
