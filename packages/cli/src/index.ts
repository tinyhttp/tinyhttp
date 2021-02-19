import cac from 'cac'
import pm from 'which-pm-runs'
import { exec } from 'child_process'
import { mkdir, writeFile } from 'fs/promises'
import { promisify } from 'util'
import { get } from 'httpie'
import * as colorette from 'colorette'
import editPkgJson from 'edit-json-file'
import ora from 'ora'

const runCmd = promisify(exec)

const msg = (m: string, color: string) => console.log(colorette[color](m))

const ESLINT_JS_CONFIG = `
{
  "env": {
    "es6": true,
    "node": true
  },
  "parserOptions": {
    "ecmaVersion": 2020,
    "sourceType": "module"
  },
  "plugins": ["prettier"],
  "extends": ["eslint:recommended", "prettier"],
}
`

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

const install = (pkg: string, pkgs: string[], dev = true) =>
  runCmd(`${pkg} ${pkg === 'yarn' ? 'add' : 'i'} ${dev ? '-D' : '-S'} ${pkgs.join(' ')}`)

const cli = cac('tinyhttp')

let pkg: 'pnpm' | 'npm' | 'yarn' = 'pnpm'

const { options } = cli.parse()

const info = pm()

if (info?.name) pkg = info.name as typeof pkg

if (options.pkg) pkg = options.pkg

const file = editPkgJson('../package.json')

const fileFetcher = async (data: any, statusCode: number) => {
  let spinner = ora()

  spinner.start(colorette.blue(`Fetching ${data.length} files...`))

  if (statusCode !== 200) console.warn(`Bad status code: ${statusCode}`)

  // Download files
  for (const { name, download_url, type, url } of data) {
    if (type !== 'dir') {
      spinner.text = `Fetching ${name} file`
      const { data } = await get(download_url, httpHeaders)

      await writeFile(name, data)
    } else {
      spinner.text = `Scanning ${name} directory`
      await mkdir(name)
      const { data, statusCode } = await get(url, httpHeaders)
      await fileFetcher(data, statusCode)
    }
  }

  spinner.stop()
}

cli
  .version(file.get('version'))
  .help()
  .command('new <project>', 'Create new tinyhttp project from template')
  .option('--prettier', 'Setup Prettier')
  .option('--eslint', 'Setup ESLint')
  .option('--eslint-ts', 'Setup ESLint for TypeScript')
  .option('--pkg [pkg]', 'Choose package manager')
  .action(async (name, options) => {
    msg(`Creating a new tinyhttp project from ${name} template ⚡`, 'cyan')

    msg('Fetching template contents ⌛', 'green')

    await mkdir(name)

    process.chdir(name)

    const { data, statusCode } = await get(
      `https://api.github.com/repos/talentlessguy/tinyhttp/contents/examples/${name}`,
      httpHeaders
    )

    await fileFetcher(data, statusCode)

    // CLI options

    if (options.prettier) {
      msg(`Setting up Prettier`, 'green')
      await install(pkg, ['prettier'])
      await writeFile('.prettierrc', PRETTIER_CONFIG)
    }

    if (options.eslint) {
      msg(`Setting up ESLint`, 'green')
      await install(pkg, ['eslint', 'prettier', 'eslint-config-prettier', 'eslint-plugin-prettier'], true)
      await writeFile('.eslintrc', ESLINT_JS_CONFIG)
    }

    if (options['eslint-ts']) {
      msg(`Setting up ESLint for TypeScript`, 'green')
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
      await writeFile('.eslintrc', ESLINT_TS_CONFIG)
    }

    // Edit package.json

    const file = editPkgJson('package.json')

    const allDeps = Object.keys(file.get('dependencies'))

    // Replace "workspace:*" with "latest"

    const thDeps = allDeps.filter((x) => x.startsWith('@tinyhttp'))

    const newDeps = {}

    for (const dep of thDeps) newDeps[dep] = 'latest'

    file
      .set('dependencies', {
        ...file.get('dependencies'),
        ...newDeps
      })
      .save()

    // Install packages

    const depCount = Object.keys(file.get('dependencies')).length + Object.keys(file.get('devDependencies')).length

    const spinner = ora()

    spinner.start(colorette.cyan(`Installing ${depCount} package${depCount > 1 ? 's' : ''} with ${pkg} 📦`))

    await runCmd(`${pkg} ${pkg === 'yarn' ? 'add' : 'i'}`)

    spinner.stop()

    // Finish

    msg(`Done! You can now launch your project with \`${pkg} run start\``, 'blue')
  })
cli.parse()
