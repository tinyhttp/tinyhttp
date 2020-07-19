import { App } from '../packages/app/src'
import serve from 'serve-handler'
import { markdownStaticHandler as md } from '../packages/markdown/src'
import { logger } from '@tinyhttp/logger'
import { createReadStream } from 'fs'
import { transformMWPageStream, transformPageIndexStream } from './streams'
import unfetch from 'isomorphic-unfetch'

const app = new App()

const HTML_PATH = `${process.cwd()}/pages/html`

const NON_MW_PKGS = ['app', 'etag', 'cookie', 'cookie-signature']

app
  .use(
    logger({
      timestamp: {
        format: 'MM:SS',
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
        next()
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
    })
  )
  .use((req, res) =>
    serve(req, res, {
      public: 'static',
    })
  )

app.listen(3000, () => console.log(`Running on http://localhost:3000`))
