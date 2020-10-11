import { App } from '@tinyhttp/app'
import marked from 'marked'
import util from 'util'
import fs from 'fs'
import path from 'path'

const app = new App()

const readFile = util.promisify(fs.readFile)
const __dirname = path.resolve()

app
  .get('/', async (_, res) => {
    const path = __dirname + '/pages/hello.md'
    const file = await readFile(path)
    const text = marked(file.toString())

    res.send(text)
  })
  .get('/about', async (req, res) => {
    const path = __dirname + '/pages/about.md'
    const file = await readFile(path)
    const text = marked(file.toString())

    res.send(text)
  })
  .listen(3000, () => console.log(`Listening on http://localhost:3000`))
