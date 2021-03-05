import { App } from '@tinyhttp/app'
import serve from 'sirv'
import { markdownStaticHandler as md } from '@tinyhttp/markdown'
import { logger } from '@tinyhttp/logger'
import { createReadStream } from 'fs'
import { transformMWPageStream, transformPageIndexStream } from './streams'
import fetchCache from 'node-fetch-cache'
import hljs from 'highlight.js'

const fetch = fetchCache(`${__dirname}/.cache`)

const app = new App({
  settings: {
    networkExtensions: true
  },
  noMatchHandler: (_, res) => {
    res.format({
      text: (_, res) => res.sendStatus(404),
      html: (_, res) => res.sendFile(`${process.cwd()}/static/404.html`)
    })
  }
})

const HTML_PATH = `${process.cwd()}/pages/html`

const PORT = parseInt(process.env.PORT, 10) || 3000

const NON_MW_PKGS: string[] = [
  'app',
  'etag',
  'cookie',
  'cookie-signature',
  'dotenv',
  'send',
  'router',
  'req',
  'res',
  'type-is',
  'content-disposition',
  'forwarded',
  'proxy-addr',
  'accepts',
  'cli'
]

app
  .use(
    logger({
      ip: true,
      timestamp: true,
      output: {
        callback: console.log,
        color: false
      }
    })
  )
  .use(
    serve('static', {
      dev: process.env.NODE_ENV !== 'production',
      immutable: process.env.NODE_ENV === 'production'
    })
  )
  .get('/mw', async (req, res, next) => {
    try {
      const request = await fetch('https://api.github.com/repos/talentlessguy/tinyhttp/contents/packages')

      const json = await request.json()

      const readStream = createReadStream(`${HTML_PATH}/search.html`)

      let transformer = transformPageIndexStream(json.filter((e) => !NON_MW_PKGS.includes(e.name)))

      if (req.query.q) {
        const results = json.filter((el: any) => {
          const query = req.query.q as string

          return el.name.indexOf(query.toLowerCase()) > -1
        })
        transformer = transformPageIndexStream(results.filter((e) => !NON_MW_PKGS.includes(e.name)))
      }

      readStream.pipe(transformer).pipe(res)
    } catch (e) {
      next(e)
    }
  })
  .get('/mw/:mw', async (req, res, next) => {
    if (NON_MW_PKGS.includes(req.params.mw)) {
      next()
    } else {
      let json: any, status: number

      try {
        const res = await fetch(`https://registry.npmjs.org/@tinyhttp/${req.params.mw}`)

        status = res.status
        json = await res.json()
      } catch (e) {
        next(e)
      }

      if (status === 404) res.sendStatus(status)
      else {
        const readStream = createReadStream(`${HTML_PATH}/mw.html`)

        readStream.pipe(transformMWPageStream(json)).pipe(res)
      }
    }
  })
  .use(
    md('pages/md', {
      stripExtension: true,

      markedOptions: {
        highlight: (code, lang) => {
          if (!lang) lang = 'txt'

          return hljs.highlight(lang, code).value
        },
        headerIds: true
      },
      caching: {
        maxAge: 3600 * 24 * 365,
        immutable: true
      }
    })
  )

  .listen(3000, () =>
    console.log(`Running on http://localhost:${PORT} in ${process.env.NODE_ENV || 'development'} mode`)
  )
