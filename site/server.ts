import { App } from '../packages/app/src'
import serve from 'sirv'
import { markdownStaticHandler as md } from '../packages/markdown/src'
import { logger } from '../packages/logger'
import { createReadStream } from 'fs'
import { transformMWPageStream, transformPageIndexStream } from './streams'
import unfetch from 'isomorphic-unfetch'
import hljs from 'highlight.js'

const app = new App({
  settings: {
    networkExtensions: true,
  },
})

const HTML_PATH = `${process.cwd()}/pages/html`

const NON_MW_PKGS: string[] = ['app', 'etag', 'cookie', 'cookie-signature', 'dotenv']

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
    let json: any, status: number, msg: string

    try {
      const res = await unfetch('https://api.github.com/repos/talentlessguy/tinyhttp/contents/packages')

      status = res.status
      msg = res.statusText
      json = await res.json()
    } catch (e) {
      next(e)
    }

    if (status !== 200) {
      next(msg)
    } else {
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
    }
  })
  .get('/mw/:mw', async (req, res, next) => {
    if (NON_MW_PKGS.includes(req.params.mw)) {
      next()
    } else {
      let json: any, status: number

      try {
        const res = await unfetch(`https://registry.npmjs.org/@tinyhttp/${req.params.mw}`)

        status = res.status
        json = await res.json()
      } catch (e) {
        next(e)
      }

      if (status === 404) {
        res.sendStatus(status)
      } else {
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
        highlight: function (code, lang) {
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
