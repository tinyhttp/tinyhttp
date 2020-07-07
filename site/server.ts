import { App } from '@tinyhttp/app'
import serve from 'serve-handler'
import { markdownStaticHandler as md } from '@tinyhttp/markdown'
import logger from '@tinyhttp/logger'

const app = new App()

app
  .use(logger())
  .use(
    md('docs', {
      prefix: '/docs',
      stripExtension: true,
      markedExtensions: [
        {
          headerIds: true
        }
      ]
    })
  )
  .use((req, res) =>
    serve(req, res, {
      public: 'static'
    })
  )

app.listen(3000, () => console.log(`Running on http://localhost:3000`))
