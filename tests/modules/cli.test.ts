import { describe, expect, it } from '@jest/globals'
import path from 'path'
import { rm, readdir, mkdir, readFile } from 'fs/promises'
import { exec } from 'child_process'
import { runCmd, install } from '../../packages/cli/src/utils'

import { dirname, filename } from 'dirname-filename-esm'

const __dirname = dirname(import.meta)
const __filename = filename(import.meta)

const FIXTURES_PATH = path.join(__dirname, '../fixtures')

const MOD_PATH = path.join(FIXTURES_PATH, 'test')

describe('CLI utils', () => {
  describe('runCmd(cmd)', () => {
    it('should work the same as child_process.exec(cmd)', async () => {
      const { stdout } = await runCmd('pwd')

      let syncStdout = ''

      exec('pwd', (_, stdout) => (syncStdout += stdout)).on('close', () => {
        expect(stdout).toBe(syncStdout)
      })
    })
  })
  /* describe('install(pkgManager, ...pkgs)', () => {
    let cwd: string
    beforeEach(async () => {
      cwd = process.cwd()
      await mkdir(MOD_PATH)
      process.chdir(MOD_PATH)
    })
    afterEach(async () => {
      process.chdir(cwd)
      await rm(MOD_PATH, { recursive: true, force: true })
    })
    it('installs a dependency with pnpm', async () => {
      await runCmd('pnpm init -y')

      await install('pnpm', ['milliparsec'], false)

      const dir = await readdir('.')

      expect(dir.sort()).toEqual(['node_modules', 'package.json'].sort())

      const pkgJSON = await readFile('package.json')

      const { dependencies } = JSON.parse(pkgJSON.toString())

      expect(Object.keys(dependencies)).toContain('milliparsec')
    })
    it('installs a dependency with npm', async () => {
      await runCmd('npm init -y')

      await install('npm', ['milliparsec'], false)

      const dir = await readdir('.')

      expect(dir.sort()).toEqual(['node_modules', 'package.json', 'package-lock.json'].sort())

      const pkgJSON = await readFile('package.json')

      const { dependencies } = JSON.parse(pkgJSON.toString())

      expect(Object.keys(dependencies)).toContain('milliparsec')
    })
  }) */
})
