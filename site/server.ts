import { App } from '../packages/app/src'
import serve from 'sirv'
import { markdownStaticHandler as md } from '../packages/markdown/src'
import { logger } from '../packages/logger/src'
import { createReadStream } from 'fs'
import { transformMWPageStream, transformPageIndexStream } from './streams'
import fetchCache from 'node-fetch-cache'
import hljs from 'highlight.js'

const fetch = fetchCache(`${__dirname}/.cache`)

const app = new App({
  settings: {
    networkExtensions: true,
  },
})

const HTML_PATH = `${process.cwd()}/pages/html`

const NON_MW_PKGS: string[] = ['app', 'etag', 'cookie', 'cookie-signature', 'dotenv', 'send', 'router', 'req', 'res', 'type-is', 'content-disposition']

app
  .use(
    logger({
      ip: true,
      timestamp: true,
      output: {
        callback: console.log,
        color: false,
      },
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
      markedExtensions: [
        {
          headerIds: true,
        },
      ],
      markedOptions: {
        highlight: (code, lang) => {
          if (!lang) lang = 'txt'

          return hljs.highlight(lang, code).value
        },
      },
    })
  )
  .use(
    serve('static', {
      dev: process.env.NODE_ENV !== 'production',
      immutable: process.env.NODE_ENV === 'production',
    })
  )

app.listen(3000, () => console.log(`Running on http://localhost:3000`))
