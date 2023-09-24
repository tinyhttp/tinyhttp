import { App } from '@tinyhttp/app'
import { CustomView } from './view.js'
import fs from 'node:fs/promises'

const app = new App()

app.set('views', `${process.cwd()}/views`)

app.set('view', CustomView)

app.engine('html', async (path, locals, _opts, cb) => {
  const template = await fs.readFile(path, 'utf-8')

  const renderedTemplate = template.replace(/{{\s*([^}\s]+)\s*}}/g, (_, placeholder) => {
    return locals[placeholder] || ''
  })
  cb(null, renderedTemplate)
})

app.get('/', (req, res) => {
  res.render('hello.html', { name: 'v1rtl' })
})

app.listen(3000)
