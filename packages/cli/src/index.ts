import cac from 'cac'
import pm from 'which-pm-runs'
import { mkdir, writeFile } from 'fs/promises'
import { get } from 'httpie'
import editPkgJson from 'edit-json-file'

import { installPackages, fileFetcher, install, setupEslint, msg, setPackageJsonName } from './utils'

const ESLINT_TS_CONFIG = `
{
  "parser": "@typescript-eslint/parser",
  "extends": ["plugin:@typescript-eslint/recommended", "eslint:recommended", "prettier/@typescript-eslint"],
  "plugins": ["prettier"],
  "parserOptions": {
    "ecmaVersion": 2020,
    "sourceType": "module"
  },
  "env": {
    "node": true,
    "es6": true,
    "jest": true
  },
  "rules": {
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-unused-vars": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/ban-ts-comment": "off",
    "no-unused-vars": "off",
    "no-console": "off",
    "no-undef": "off"
  }
}
`

const PRETTIER_CONFIG = `
{
  "semi": false,
  "singleQuote": true,
  "printWidth": 120,
  "trailingComma": "none",
  "tabWidth": 2
}
`

const httpHeaders = {
  headers: { 'user-agent': 'node.js' }
}

const cli = cac('tinyhttp')

let pkg: 'pnpm' | 'npm' | 'yarn' = 'pnpm'

const { options } = cli.parse()

const info = pm()

if (info?.name) pkg = info.name as typeof pkg

if (options.pkg) pkg = options.pkg

const file = editPkgJson('../package.json')

cli
  .version(file.get('version'))
  .help()
  .command('new <project> [folder]', 'Create new tinyhttp project from template', {})
  .option('--prettier', 'Setup Prettier')
  .option('--eslint', 'Setup ESLint')
  .option('--eslint-ts', 'Setup ESLint for TypeScript')
  .option('--full', 'Setup ESLint & Prettier')
  .option('--pkg [pkg]', 'Choose package manager')
  .action(async (name, folder, options) => {
    const dir = folder || name

    msg(`Creating a new tinyhttp project from ${name} template in ${dir} folder ⚡`, 'cyan')

    msg('Fetching template contents ⌛', 'green')

    try {
      await mkdir(dir)
    } catch {
      throw new Error('Failed to create project directory')
    }

    process.chdir(dir)

    const { data, statusCode } = await get(
      `https://api.github.com/repos/talentlessguy/tinyhttp/contents/examples/${name}`,
      httpHeaders
    )

    await fileFetcher(data, statusCode)

    // CLI options

    const setupPrettier = async () => {
      msg(`Setting up Prettier`, 'green')
      try {
        await install(pkg, ['prettier'])
      } catch {
        throw new Error('Failed to install Prettier')
      }

      try {
        await writeFile('.prettierrc', PRETTIER_CONFIG)
      } catch {
        throw new Error('Failed to create Prettier config')
      }
    }

    if (options.full) {
      setupPrettier()
      setupEslint(pkg)
    }

    if (options.prettier) await setupPrettier()

    if (options.eslint) await setupEslint(pkg)

    if (options['eslint-ts']) {
      msg(`Setting up ESLint for TypeScript`, 'green')
      try {
        await install(pkg, [
          'typescript',
          'eslint',
          'eslint-config-prettier',
          'eslint-plugin-prettier',
          '@types/node',
          '@typescript-eslint/eslint-plugin',
          '@typescript-eslint/parser',
          'prettier'
        ])
      } catch {
        throw new Error('Failed to install ESLint for TypeScript')
      }

      try {
        await writeFile('.eslintrc', ESLINT_TS_CONFIG)
      } catch {
        throw new Error('Failed to create ESLint config')
      }
    }

    setPackageJsonName(dir)
    await installPackages(pkg)

    // Finish

    msg(
      `Done! You can now launch your project with running these commands:
    
    cd ${dir}  

    ${pkg} run start
    `,
      'blue'
    )
  })
cli.parse()
