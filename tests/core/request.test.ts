import { describe, it } from 'vitest'
import { InitAppAndTest } from '../../test_helpers/initAppAndTest'
import { App } from '../../packages/app/src/app'
import { makeFetch } from 'supertest-fetch'
import { Agent } from 'node:http'

describe('Request properties', () => {
  it('should have default HTTP Request properties', async () => {
    const { fetch } = InitAppAndTest((req, res) => {
      res.status(200).json({
        url: req.url,
        headersSent: res.headersSent
      })
    })

    await fetch('/').expect(200, { url: '/', headersSent: false })
  })

  describe('URL extensions', () => {
    it('req.query is being parsed properly', async () => {
      const { fetch } = InitAppAndTest((req, res) => void res.send(req.query))

      await fetch('/?param1=val1&param2=val2').expect(200, {
        param1: 'val1',
        param2: 'val2'
      })
    })
    it('req.params is being parsed properly', async () => {
      const { fetch } = InitAppAndTest((req, res) => void res.send(req.params), '/:param1/:param2')

      await fetch('/val1/val2').expect(200, {
        param1: 'val1',
        param2: 'val2'
      })
    })
    it('req.url does not include the mount path', async () => {
      const app = new App()

      app.use('/abc', (req, res) => res.send(req.url))

      const server = app.listen()

      const fetch = makeFetch(server)

      await fetch('/abc/def').expect(200, '/def')
    })
    it('should set the correct req.url on routes even in a subapp', async () => {
      const makeApp = () =>
        new App().get('/a1/b/*', (req, res) => res.send(req.url)).get('/a2/b/:pat', (req, res) => res.send(req.url))

      const app = makeApp()
      app.use('/s/:pat1/:pat2', makeApp())
      const fetch = makeFetch(app.listen())
      await fetch('/a1/b/c').expect(200, '/a1/b/c')
      await fetch('/a2/b/c').expect(200, '/a2/b/c')
      await fetch('/s/t/u/a1/b/c').expect(200, '/a1/b/c')
      await fetch('/s/t/u/a2/b/c').expect(200, '/a2/b/c')
    })
    it('should set the correct req.url on middlewares even in a subapp', async () => {
      const mw = (req, res, next) => {
        req.urls ||= []
        req.urls.push(req.url)
        next()
      }
      const makeApp = () =>
        new App()
          .use('/a1/b', (req, res) => res.send(req.url))
          .use('/a2/b', mw, mw, mw, (req, res) => res.send(`${req.urls.join(' ')}`))
          .use('/a3/:pat1/:pat2', (req, res) => res.send(req.url))
          .use('/a4/:pat1/*', (req, res) => res.send(req.url))

      const app = makeApp()
      app.use('/s', makeApp())
      const fetch = makeFetch(app.listen())
      await fetch('/a1/b/c').expect(200, '/c')
      await fetch('/a2/b/c').expect(200, '/c /c /c')
      await fetch('/a3/b/c/d').expect(200, '/d')
      await fetch('/a4/b/c/d').expect(200, '/')
      await fetch('/s/a1/b/c').expect(200, '/c')
      await fetch('/s/a2/b/c').expect(200, '/c /c /c')
      await fetch('/s/a3/b/c/d').expect(200, '/d')
      await fetch('/s/a4/b/c/d').expect(200, '/')
    })
  })

  describe('Network extensions', () => {
    const ipHandler = (req, res) => {
      res.json({
        ip: req.ip,
        ips: req.ips
      })
    }
    const options = {
      settings: {
        networkExtensions: true
      }
    }
    it('IPv4 req.ip & req.ips is being parsed properly', async () => {
      const { fetch } = InitAppAndTest(ipHandler, '/', 'GET', options)

      const agent = new Agent({ family: 4 }) // ensure IPv4 only
      await fetch('/', { agent }).expect(200, {
        ip: '127.0.0.1',
        ips: ['::ffff:127.0.0.1']
      })
    })
    if (process.env.GITHUB_ACTION) {
      // skip ipv6 tests only for github ci/cd
      it('IPv6 req.ip & req.ips is being parsed properly', async () => {
        const { fetch } = InitAppAndTest(ipHandler, '/', 'GET', options)

        const agent = new Agent({ family: 6 }) // ensure IPv6 only
        await fetch('/', { agent }).expect(200, {
          ip: '1',
          ips: ['::1']
        })
      })
    }
    it('req.protocol is http by default', async () => {
      const { fetch } = InitAppAndTest(
        (req, res) => {
          res.send(`protocol: ${req.protocol}`)
        },
        '/',
        'GET',
        options
      )

      await fetch('/').expect(200, `protocol: http`)
    })
    it('req.secure is false by default', async () => {
      const { fetch } = InitAppAndTest(
        (req, res) => {
          res.send(`secure: ${req.secure}`)
        },
        '/',
        'GET',
        options
      )

      await fetch('/').expect(200, `secure: false`)
    })
    it('req.subdomains is empty by default', async () => {
      const { fetch } = InitAppAndTest(
        (req, res) => {
          res.send(`subdomains: ${req.subdomains.join(', ')}`)
        },
        '/',
        'GET',
        options
      )

      await fetch('/').expect(200, `subdomains: `)
    })
  })

  it('req.xhr is false because of node-superagent', async () => {
    const { fetch } = InitAppAndTest((req, res) => {
      res.send(`XMLHttpRequest: ${req.xhr ? 'yes' : 'no'}`)
    })

    await fetch('/').expect(200, `XMLHttpRequest: no`)
  })

  it('req.path is the URL but without query parameters', async () => {
    const { fetch } = InitAppAndTest((req, res) => {
      res.send(`Path to page: ${req.path}`)
    })

    await fetch('/page?a=b').expect(200, `Path to page: /page`)
  })
  it('req.path works properly for optional parameters', async () => {
    const { fetch } = InitAppAndTest((req, res) => {
      res.send(`Path to page: ${req.path}`)
    }, '/:format?/:uml?')

    await fetch('/page/page-1').expect(200, `Path to page: /page/page-1`)
  })
  it('req.fresh and req.stale get set', async () => {
    const etag = '123'
    const { fetch } = InitAppAndTest(
      (_req, res) => {
        res.set('ETag', etag).send('stale')
      },
      '/',
      'GET'
    )

    await fetch('/', { headers: { 'If-None-Match': etag } }).expectStatus(304)
  })
})
