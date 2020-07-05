import { App } from '@tinyhttp/app'
import { staticHandler } from '@tinyhttp/static'
import { markdownStaticHandler as md } from '@tinyhttp/markdown'
import logger from '@tinyhttp/logger'

const app = new App()

app
  .use(logger())
  .use(staticHandler('static'))
  .use(
    md('docs', {
      prefix: '/docs',
      stripExtension: true,
      markedExtensions: [
        {
          // @ts-ignore
          renderer: {
            heading(text, level) {
              const escapedText = text.toLowerCase().replace(/[^\w]+/g, '-')

              return `
              <h${level}>
                <a name="${escapedText}" class="anchor" href="#${escapedText}">
                  <span class="header-link"></span>
                </a>
                ${text}
              </h${level}>`
            }
          }
        }
      ]
    })
  )

app.listen(3000, () => console.log(`Running on http://localhost:3000`))
