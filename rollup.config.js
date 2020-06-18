import terser from 'rollup-plugin-terser'
import auto from 'rollup-plugin-auto-external'
import ts from '@wessberg/rollup-plugin-ts'
import fs from 'fs'

let cfg = []

const getPackages = () => {
  const pkgsList = fs.readdirSync('packages')

  for (let pkg of pkgsList.filter(p => p !== 'app')) {
    const pkgJson = JSON.parse(fs.readFileSync(`${__dirname}/packages/${pkg}/package.json`).toString())

    const deps = pkgJson.dependencies ? Object.keys(pkgJson.dependencies) : []

    cfg.push({
      input: `packages/${pkg}/index.ts`,
      output: {
        dir: `packages/${pkg}/dist`,
        format: 'cjs'
      },
      plugins: [auto(), ts(), terser],
      external: deps
    })
  }
}

getPackages()

export default cfg
