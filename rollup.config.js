import { terser } from 'rollup-plugin-terser'
import auto from 'rollup-plugin-auto-external'
import ts from '@wessberg/rollup-plugin-ts'
import fs from 'fs'

let cfg = []

const swapPositions = (array, a, b) => {
  ;[array[a], array[b]] = [array[b], array[a]]
}

// const pkgList = fs.readdirSync('packages').sort((a, b) => a.localeCompare(b))

// swapPositions(pkgList, pkgList.indexOf('app'), pkgList.indexOf('etag'))
// swapPositions(pkgList, pkgList.indexOf('cookie-parser'), pkgList.indexOf('cookie-signature'))

const pkgList = ['cookie-signature', 'etag', 'app', 'cookie', 'cookie-parser', 'cors', 'logger', 'static']

console.log(`Building these packages: ${pkgList.join(', ')}...`)

for (let pkg of pkgList) {
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
