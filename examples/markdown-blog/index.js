import { App } from '@tinyhttp/app'
import { createReadStream } from 'fs'
import transform from 'markdown-transform'

const app = new App()

app
  .get('/blog/:slug', async (req, res) => {
    createReadStream(`${process.cwd()}/pages/${req.params.slug}.md`).pipe(transform()).pipe(res)
  })
  .listen(3000)
