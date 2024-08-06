import { Agent } from 'node:http'
import { makeFetch } from 'supertest-fetch'
import { describe, it } from 'vitest'
import type { Request } from '../../packages/app/src'
import { App } from '../../packages/app/src/app'
import { InitAppAndTest } from '../../test_helpers/initAppAndTest'

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
      const echo = (req, res) => res.send({ url: req.url, params: req.params })
      const makeApp = () => new App().get('/a1/b/*', echo).get('/a2/b/:pat', echo)

      const app = makeApp()
      app.use('/s/:pat1/:pat2', makeApp())
      const fetch = makeFetch(app.listen())

      await fetch('/a1/b/c').expect(200, {
        url: '/a1/b/c',
        params: { wild: 'c' }
      })

      await fetch('/a2/b/c').expect(200, {
        url: '/a2/b/c',
        params: { pat: 'c' }
      })

      await fetch('/s/t/u/a1/b/c').expect(200, {
        url: '/a1/b/c',
        params: { pat1: 't', pat2: 'u', wild: 'c' }
      })

      await fetch('/s/t/u/a2/b/c').expect(200, {
        url: '/a2/b/c',
        params: { pat1: 't', pat2: 'u', pat: 'c' }
      })
    })
    it.skip('should set the correct req.url on middlewares even in a subapp', async () => {
      const echo = (req, res) => res.send({ url: req.url, params: req.params })
      const mw = (req, _res, next) => {
        req.urls ||= []
        req.urls.push(req.url)
        next()
      }
      const makeApp = () =>
        new App()
          .get('/', echo)
          .use('/a1/b', echo)
          .use('/a2/b', mw, mw, mw, (req: Request & { urls?: string[] }, res) =>
            res.send({ urls: req.urls, params: req.params })
          )
          .use('/a3/:pat1/:pat2', echo)
          .use('/a4/:pat1/*', echo)

      const app = makeApp()
      app.use('/s/:pat', makeApp())
      const fetch = makeFetch(app.listen())

      await fetch('/a1/b/c').expect(200, {
        url: '/c',
        params: {}
      })

      await fetch('/a2/b/c').expect(200, {
        urls: ['/c', '/c', '/c'],
        params: {}
      })

      await fetch('/a3/b/c/d').expect(200, {
        url: '/d',
        params: { pat1: 'b', pat2: 'c' }
      })

      await fetch('/a4/b/c/d').expect(200, {
        url: '/',
        params: { pat1: 'b', wild: 'c/d' }
      })

      await fetch('/s/t/a1/b/c').expect(200, {
        url: '/c',
        params: { pat: 't' }
      })

      await fetch('/s/t/a2/b/c').expect(200, {
        urls: ['/c', '/c', '/c'],
        params: { pat: 't' }
      })

      await fetch('/s/t/a3/b/c/d').expect(200, {
        url: '/d',
        params: { pat: 't', pat1: 'b', pat2: 'c' }
      })

      await fetch('/s/t/a4/b/c/d').expect(200, {
        url: '/',
        params: { pat: 't', pat1: 'b', wild: 'c/d' }
      })
    })
    it('should set the correct req.url on a subapp mounted on a wildcard route, for both route and mw', async () => {
      const echo = (req, res) => res.send({ url: req.url, params: req.params })
      // Only possible route on subapps below * is / since * is greedy
      const subAppRoute = new App().get('/', echo)
      const subAppMw = new App().use('/', echo)
      const app = new App().use('/s1/*', subAppRoute).use('/s2/*', subAppMw)
      const fetch = makeFetch(app.listen())
      await fetch('/s1/a/b/c/d').expect(200, {
        url: '/',
        params: { wild: 'a/b/c/d' }
      })
      await fetch('/s2/a/b/c/d').expect(200, {
        url: '/',
        params: { wild: 'a/b/c/d' }
      })
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
    it('IPv4 req.ip & req.ips do not trust proxies by default', async () => {
      const { fetch } = InitAppAndTest(ipHandler, '/', 'GET', options)

      const agent = new Agent({ family: 4 }) // ensure IPv4 only
      await fetch('/', { agent, headers: { 'x-forwarded-for': '10.0.0.1, 10.0.0.2, 127.0.0.2' } }).expect(200, {
        ip: '127.0.0.1',
        ips: ['::ffff:127.0.0.1']
      })
    })
    it('IPv4 req.ip & req.ips support trusted proxies with "trust proxy"', async () => {
      const { fetch, app } = InitAppAndTest(ipHandler, '/', 'GET', options)
      app.set('trust proxy', ['127.0.0.1'])

      const agent = new Agent({ family: 4 }) // ensure IPv4 only
      await fetch('/', { agent, headers: { 'x-forwarded-for': '10.0.0.1, 10.0.0.2, 127.0.0.2' } }).expect(200, {
        ip: '127.0.0.2',
        ips: ['::ffff:127.0.0.1', '127.0.0.2']
      })
    })
    it('req.protocol is http by default', async () => {
      const { fetch } = InitAppAndTest(
        (req, res) => {
          res.send(`protocol: ${req.protocol}`)
        },
        '/',
        'GET',
        options
      )

      await fetch('/').expect(200, 'protocol: http')
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

      await fetch('/').expect(200, 'secure: false')
    })
    it('req.subdomains is empty by default', async () => {
      const { fetch } = InitAppAndTest(
        (req, res) => {
          res.send(`subdomains: ${req.subdomains?.join(', ')}`)
        },
        '/',
        'GET',
        options
      )

      await fetch('/').expect(200, 'subdomains: ')
    })
    // describe('`getSubdomains` function test', () => {
    //   it('should test `getSubdomains` function when host is null', async () => {
    //     const app = new App()
    //     app.get('/', (req, res) => {
    //       req.headers.host = undefined
    //       res.send(getSubdomains(req))
    //     })
    //     await makeFetch(app.listen())('/').expectStatus(200)
    //   })
    //   it('should test `getSubdomains` function when host is an IP', async () => {
    //     const app = new App()
    //     app.get('/', (req, res) => {
    //       req.headers.host = '127.0.0.1'
    //       res.send(getSubdomains(req))
    //     })
    //     await makeFetch(app.listen())('/').expectStatus(200)
    //   })
    //   it('should test `getSubdomains` function when host is an array', async () => {
    //     const app = new App()
    //     app.get('/', (req, res) => {
    //       req.headers.host = '[127.0.0.1]'
    //       res.send(getSubdomains(req))
    //     })
    //     await makeFetch(app.listen())('/').expectStatus(200)
    //   })
    // })
    // describe('`getProtocol` function tests', () => {
    //   it('should test `getProtocol` function', async () => {
    //     const app = new App()
    //     app.get('/', (req, res) => {
    //       req.secure = true
    //       return res.send(getProtocol(req))
    //     })
    //     await makeFetch(app.listen())('/', { headers: { 'X-Forwarded-Proto': 'https, http' } }).expectStatus(200)
    //   })
    //   it('should test `getProtocol` function by using a default value if socket is destroyed', async () => {
    //     const app = new App()
    //     app.get('/', (req, res) => {
    //       req.socket.destroy()
    //       return res.send(getProtocol(req))
    //     })
    //     try {
    //       await makeFetch(app.listen())('/')
    //     } catch (error) {
    //       expect(error).toBeDefined()
    //     }
    //   })
    // })
  })

  it('req.xhr is false because of node-superagent', async () => {
    const { fetch } = InitAppAndTest((req, res) => {
      res.send(`XMLHttpRequest: ${req.xhr ? 'yes' : 'no'}`)
    })

    await fetch('/').expect(200, 'XMLHttpRequest: no')
  })

  it('req.path is the URL but without query parameters', async () => {
    const { fetch } = InitAppAndTest((req, res) => {
      res.send(`Path to page: ${req.path}`)
    })

    await fetch('/page?a=b').expect(200, 'Path to page: /page')
  })
  it('req.path works properly for optional parameters', async () => {
    const { fetch } = InitAppAndTest((req, res) => {
      res.send(`Path to page: ${req.path}`)
    }, '/:format?/:uml?')

    await fetch('/page/page-1').expect(200, 'Path to page: /page/page-1')
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
