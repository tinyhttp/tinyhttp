import { App } from '@tinyhttp/app'
import { markdownStaticHandler } from '@tinyhttp/markdown'

const app = new App()

app
  .use(
    '/blog',
    markdownStaticHandler('pages', {
      prefix: '/blog',
      caching: {
        maxAge: 3600 * 24 * 365,
        immutable: true
      }
    })
  )
  .listen(3000)
