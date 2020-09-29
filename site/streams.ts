import { Transform } from 'stream'
import marked from 'marked'

export const transformMWPageStream = (json: any) =>
  new Transform({
    transform(chunk: Buffer, _, cb) {
      const name = json.name
      const version = json['dist-tags'].latest

      const pkgBody = json.versions[version]

      const readme = json.readme

      const repo = pkgBody.repository

      const dir = repo.directory

      const link = repo.url.replace(repo.type + '+', '').replace('.git', '')

      const doc = chunk
        .toString()
        .replace('{readme}', readme ? marked(readme) : '')
        .replace('{name}', name.slice(name.indexOf('/') + 1, name.length))
        .replace('{pkg}', name)
        .replace('{version}', version)
        .replace('{dir}', dir)
        .replace('{link}', `${link}/blob/master/${dir}`)

      cb(null, doc)
    },
  })

const MWPreviewTemplate = (mw: { name: string }) => `
<a class="mw_preview" href="/mw/${mw.name}">
  <div>
    <h3>${mw.name}</h3>
  </div>
</a>
`

export const transformPageIndexStream = (pkgs: any[]) => {
  return new Transform({
    transform(chunk: Buffer, _, cb) {
      const doc = chunk
        .toString()
        .replace('{pkgTemplates}', pkgs.map((pkg) => MWPreviewTemplate(pkg)).join('<br />'))
        .replace('{ pkgs }', pkgs.map((p) => `'${p.name}'`).join(', '))

      cb(null, doc)
    },
  })
}
