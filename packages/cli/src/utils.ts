import { writeFile, mkdir } from 'fs/promises'
import ora from 'ora'
import { get } from 'httpie'
import * as colorette from 'colorette'

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

export const installPackages = async () => {

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
    (Object.keys(file.get('dependencies')) || []).length + (Object.keys(file.get('devDependencies')) || []).length

  const spinner = ora()

  spinner.start(colorette.cyan(`Installing ${depCount} package${depCount > 1 ? 's' : ''} with ${pkg} 📦`))

  try {
    await runCmd(`${pkg} ${pkg === 'yarn' ? 'add' : 'i'}`)
  } catch {
    throw new Error('Failed to install packages')
  }

  spinner.stop()
}
