import { writeFile, mkdir } from 'fs/promises'
import ora from 'ora'
import { get } from 'httpie'
import editPkgJson from 'edit-json-file'
import * as colorette from 'colorette'
import { exec } from 'child_process'
import { promisify } from 'util'

export const msg = (m: string, color: string) => console.log(colorette[color](m))

export const runCmd = promisify(exec)

export const install = async (pkg: string, pkgs: string[], dev = true) =>
  await runCmd(`${pkg} ${pkg === 'yarn' ? 'add' : 'i'} ${dev ? '-D' : '-S'} ${pkgs.join(' ')}`)

const httpHeaders = {
  headers: { 'user-agent': 'node.js' }
}

export const fileFetcher = async (data: any, statusCode: number, dir?: string) => {
  const spinner = ora()

  spinner.start(colorette.blue(`Fetching ${data.length} files...`))

  if (statusCode !== 200) console.warn(`Bad status code: ${statusCode}`)

  // Download files
  for (const { name, download_url, type, url } of data) {
    if (type !== 'dir') {
      spinner.text = `Fetching ${name} file`
      const { data } = await get(download_url, httpHeaders)

      try {
        await writeFile(dir ? `${dir}/${name}` : name, data)
      } catch {
        throw new Error('Failed to create a project file')
      }
    } else {
      spinner.text = `Scanning ${name} directory`
      try {
        await mkdir(name)
      } catch {
        throw new Error('Failed to create a project subdirectory')
      }
      const { data, statusCode } = await get(url, httpHeaders)
      await fileFetcher(data, statusCode, name)
    }
  }

  spinner.stop()
}

export const installPackages = async (pkg: string) => {
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

  const depCount =
    (Object.keys(file.get('dependencies')) || []).length + (Object.keys(file.get('devDependencies') || {}) || []).length

  const spinner = ora()

  spinner.start(colorette.cyan(`Installing ${depCount} package${depCount > 1 ? 's' : ''} with ${pkg} 📦`))

  try {
    await runCmd(`${pkg} ${pkg === 'yarn' ? 'add' : 'i'}`)
  } catch {
    throw new Error('Failed to install packages')
  }

  spinner.stop()
}

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

export const setupEslint = async (pkg: string) => {
  msg(`Setting up ESLint`, 'green')
  try {
    await install(pkg, ['eslint', 'prettier', 'eslint-config-prettier', 'eslint-plugin-prettier'], true)
  } catch {
    throw new Error('Failed to install ESLint')
  }
  try {
    await writeFile('.eslintrc', ESLINT_JS_CONFIG)
  } catch {
    throw new Error('Failed to create ESLint config')
  }
}

export const setPackageJsonName = (name: string) => {
  const file = editPkgJson('package.json')
  file.set('name', name).save()
}
