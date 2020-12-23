import path from 'path'
import fs from 'fs/promises'
import { Stats } from 'fs'

export type PackageManager = 'pnpm' | 'yarn' | 'npm'

function getPaths(bin: string) {
  const envPath = process.env.PATH || ''
  const envExt = process.env.PATHEXT || ''
  return envPath
    .replace(/["]+/g, '')
    .split(path.delimiter)
    .map((chunk) => envExt.split(path.delimiter).map((ext) => path.join(chunk, bin + ext)))
    .reduce((a, b) => a.concat(b))
}

async function fileExists(filePath: string) {
  let stat: Stats
  try {
    stat = await fs.stat(filePath)
  } catch {
    return false
  }

  return stat.isFile()
}

const pkgs: PackageManager[] = ['pnpm', 'yarn', 'npm']

export type PkgInfo = {
  p: string
  pkg: PackageManager
}

const getValidPaths = async (): Promise<PkgInfo[]> => {
  const paths = []
  for (const pkg of pkgs) {
    for (const p of getPaths(pkg)) {
      const exists = await fileExists(p)

      if (exists)
        paths.push({
          p,
          pkg
        })
    }
  }
  return paths
}

export const getBestPkg = async () => {
  let bestPkg: PkgInfo
  for (const { p, pkg } of await getValidPaths()) {
    bestPkg = { p, pkg }
    if (pkg === 'pnpm') {
      break
    }
  }

  return bestPkg.pkg
}
