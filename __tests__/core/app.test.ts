import http from 'http'
import { readFile } from 'fs/promises'
import { App } from '../../packages/app/src'

import { renderFile } from 'eta'
import type { EtaConfig } from 'eta/dist/types/config'
import { InitAppAndTest } from '../../test_helpers/initAppAndTest'
import { makeFetch } from 'supertest-fetch'

describe('Testing App', () => {
  it('should launch a basic server', async () => {
    const { fetch } = InitAppAndTest((_req, res) => void res.send('Hello World'))

    await fetch('/').expect(200, 'Hello World')
  })
  it('should chain middleware', () => {
    const app = new App()

    app.use((_req, _res, next) => next()).use((_req, _res, next) => next())

    expect(app.middleware.length).toBe(2)
  })
  it('app.locals are get and set', () => {
    const app = new App()

    app.locals.hello = 'world'

    expect(app.locals.hello).toBe('world')
  })
  it('Custom noMatchHandler works', async () => {
    const app = new App({
      noMatchHandler: (req, res) => res.status(404).end(`Oopsie! Page ${req.url} is lost.`)
    })

    const server = app.listen()

    const fetch = makeFetch(server)

    await fetch('/').expect(404, 'Oopsie! Page / is lost.')
  })
  it('Custom onError works', async () => {
    const app = new App({
      onError: (err, req, res) => res.status(500).end(`Ouch, ${err} hurt me on ${req.url} page.`)
    })

    app.use((_req, _res, next) => next('you'))

    const server = app.listen()
    const fetch = makeFetch(server)

    await fetch('/').expect(500, 'Ouch, you hurt me on / page.')
  })

  it('App works with HTTP 1.1', async () => {
    const app = new App()

    const server = http.createServer()

    server.on('request', app.attach)

    await makeFetch(server)('/').expect(404)
  })
  it('req and res inherit properties from previous middlewares', async () => {
    const app = new App()

    app
      .use((req, _res, next) => {
        req.body = { hello: 'world' }
        next()
      })
      .use((req, res) => {
        res.json(req.body)
      })

    const server = app.listen()

    const fetch = makeFetch(server)

    await fetch('/').expect(200, { hello: 'world' })
  })
  it('req and res inherit properties from previous middlewares asynchronously', async () => {
    const app = new App()

    app
      .use(async (req, _res, next) => {
        req.body = await readFile(`${process.cwd()}/__tests__/fixtures/test.txt`)
        next()
      })
      .use((req, res) => res.send(req.body.toString()))

    const server = app.listen()

    await makeFetch(server)('/').expect(200, 'I am a text file.')
  })
})

describe('Testing App routing', () => {
  it('should respond on matched route', async () => {
    const { fetch } = InitAppAndTest((_req, res) => void res.send('Hello world'), '/route')

    await fetch('/route').expect(200, 'Hello world')
  })
  it('should match wares containing base path', async () => {
    const app = new App()

    const server = app.listen()

    app.use('/abc', (_req, res) => void res.send('Hello world'))

    await makeFetch(server)('/abc/def').expect(200, 'Hello world')

    await makeFetch(server)('/abcdef').expect(404)
  })
  it('"*" should catch all undefined routes', async () => {
    const app = new App()

    const server = app.listen()

    app
      .get('/route', (_req, res) => void res.send('A different route'))
      .all('*', (_req, res) => void res.send('Hello world'))

    await makeFetch(server)('/route').expect(200, 'A different route')

    await makeFetch(server)('/test').expect(200, 'Hello world')
  })
  it('should throw 404 on no routes', async () => {
    await makeFetch(new App().listen())('/').expect(404)
  })
  it('should flatten the array of wares', async () => {
    const app = new App()

    let counter = 1

    app.use('/abc', [(_1, _2, next) => counter++ && next(), (_1, _2, next) => counter++ && next()], (_req, res) => {
      expect(counter).toBe(3)
      res.send('Hello World')
    })

    await makeFetch(app.listen())('/abc').expect(200, 'Hello World')
  })
  describe('next(err)', () => {
    it('next function skips current middleware', async () => {
      const app = new App()

      app.locals['log'] = 'test'

      app
        .use((req, _res, next) => {
          app.locals['log'] = req.url
          next()
        })
        .use((_req, res) => void res.json({ ...app.locals }))

      await makeFetch(app.listen())('/').expect(200, { log: '/' })
    })
    it('next function handles errors', async () => {
      const app = new App()

      app.use((req, res, next) => {
        if (req.url === '/broken') {
          next('Your appearance destroyed this world.')
        } else {
          res.send('Welcome back')
        }
      })

      await makeFetch(app.listen())('/broken').expect(500, 'Your appearance destroyed this world.')
    })
    it("next function sends error message if it's not an HTTP status code or string", async () => {
      const app = new App()

      app.use((req, res, next) => {
        if (req.url === '/broken') {
          next(new Error('Your appearance destroyed this world.'))
        } else {
          res.send('Welcome back')
        }
      })

      await makeFetch(app.listen())('/broken').expect(500, 'Your appearance destroyed this world.')
    })
    it('errors in async wares do not destroy the app', async () => {
      const app = new App()

      app.use(async (_req, _res) => {
        throw `bruh`
      })

      const server = app.listen()

      await makeFetch(server)('/').expect(500, 'bruh')
    })

    it('errors in sync wares do not destroy the app', async () => {
      const app = new App()

      app.use((_req, _res) => {
        throw `bruh`
      })

      const server = app.listen()

      await makeFetch(server)('/').expect(500, 'bruh')
    })
  })
})

describe('App methods', () => {
  it('`app.set` sets a setting', () => {
    const app = new App().set('subdomainOffset', 1)

    expect(app.settings.subdomainOffset).toBe(1)
  })
  it(`app.enable enables a setting`, () => {
    const app = new App({
      settings: {
        xPoweredBy: false
      }
    }).enable('xPoweredBy')

    expect(app.settings.xPoweredBy).toBe(true)
  })
  it(`app.disable disables a setting`, async () => {
    const app = new App({
      settings: {
        xPoweredBy: true
      }
    }).disable('xPoweredBy')

    expect(app.settings.xPoweredBy).toBe(false)
  })
  it('app.route works properly', async () => {
    const app = new App()

    app.route('/').get((req, res) => res.end(req.url))

    const server = app.listen()

    await makeFetch(server)('/').expect(200)
  })
  it('app.route supports chaining route methods', async () => {
    const app = new App()

    app.route('/').get((req, res) => res.end(req.url))

    const server = app.listen()

    await makeFetch(server)('/').expect(200)
  })
  it('app.route supports chaining route methods', async () => {
    const app = new App()

    app
      .route('/')
      .get((_, res) => res.send('GET request'))
      .post((_, res) => res.send('POST request'))

    const server = app.listen()

    await makeFetch(server)('/').expect(200, 'GET request')

    await makeFetch(server)('/', { method: 'POST' }).expect(200, 'POST request')
  })
})

describe('HTTP methods', () => {
  it('app.get handles get request', async () => {
    const app = new App()

    app.get('/', (req, res) => void res.send(req.method))

    await makeFetch(app.listen())('/').expect(200, 'GET')
  })
  it('app.post handles post request', async () => {
    const { fetch } = InitAppAndTest((req, res) => void res.send(req.method), '/', 'POST')

    await fetch('/', {
      method: 'POST'
    }).expect(200, 'POST')
  })
  it('app.put handles put request', async () => {
    const { fetch } = InitAppAndTest((req, res) => void res.send(req.method), '/', 'PUT')

    await fetch('/', {
      method: 'PUT'
    }).expect(200, 'PUT')
  })
  it('app.patch handles patch request', async () => {
    const { fetch } = InitAppAndTest((req, res) => void res.send(req.method), '/', 'PATCH')

    await fetch('/', { method: 'PATCH' }).expect(200, 'PATCH')
  })
  it('app.head handles head request', async () => {
    const app = new App()

    app.head('/', (req, res) => void res.send(req.method))

    const server = app.listen()
    const fetch = makeFetch(server)

    await fetch('/', { method: 'HEAD' }).expect(200, '')
  })
  it('app.delete handles delete request', async () => {
    const app = new App()

    app.delete('/', (req, res) => void res.send(req.method))

    const server = app.listen()
    const fetch = makeFetch(server)

    await fetch('/', { method: 'DELETE' }).expect(200, 'DELETE')
  })
  it('app.checkout handles checkout request', async () => {
    const app = new App()

    app.checkout('/', (req, res) => void res.send(req.method))

    const server = app.listen()
    const fetch = makeFetch(server)

    await fetch('/', { method: 'CHECKOUT' }).expect(200, 'CHECKOUT')
  })
  it('app.copy handles copy request', async () => {
    const app = new App()

    app.copy('/', (req, res) => void res.send(req.method))

    const server = app.listen()
    const fetch = makeFetch(server)

    await fetch('/', { method: 'COPY' }).expect(200, 'COPY')
  })
  it('app.lock handles lock request', async () => {
    const app = new App()

    app.lock('/', (req, res) => void res.send(req.method))

    const server = app.listen()
    const fetch = makeFetch(server)

    await fetch('/', { method: 'LOCK' }).expect(200, 'LOCK')
  })
  it('app.merge handles merge request', async () => {
    const app = new App()

    app.merge('/', (req, res) => void res.send(req.method))

    const server = app.listen()
    const fetch = makeFetch(server)

    await fetch('/', { method: 'MERGE' }).expect(200, 'MERGE')
  })
  it('app.mkactivity handles mkactivity request', async () => {
    const app = new App()

    app.mkactivity('/', (req, res) => void res.send(req.method))

    const server = app.listen()

    const fetch = makeFetch(server)

    await fetch('/', { method: 'MKACTIVITY' }).expect(200, 'MKACTIVITY')
  })
  it('app.mkcol handles mkcol request', async () => {
    const app = new App()

    app.mkcol('/', (req, res) => void res.send(req.method))

    const server = app.listen()
    const fetch = makeFetch(server)

    await fetch('/', { method: 'MKCOL' }).expect(200, 'MKCOL')
  })
  it('app.move handles move request', async () => {
    const app = new App()

    app.move('/', (req, res) => void res.send(req.method))

    const server = app.listen()
    const fetch = makeFetch(server)

    await fetch('/', { method: 'MOVE' }).expect(200, 'MOVE')
  })
  it('app.search handles search request', async () => {
    const app = new App()

    app.search('/', (req, res) => void res.send(req.method))

    const server = app.listen()
    const fetch = makeFetch(server)

    await fetch('/', { method: 'SEARCH' }).expect(200, 'SEARCH')
  })
  it('app.notify handles notify request', async () => {
    const app = new App()

    app.notify('/', (req, res) => void res.send(req.method))

    const server = app.listen()
    const fetch = makeFetch(server)

    await fetch('/', { method: 'NOTIFY' }).expect(200, 'NOTIFY')
  })
  it('app.purge handles purge request', async () => {
    const app = new App()

    app.purge('/', (req, res) => void res.send(req.method))

    const server = app.listen()
    const fetch = makeFetch(server)

    await fetch('/', { method: 'PURGE' }).expect(200, 'PURGE')
  })
  it('app.report handles report request', async () => {
    const app = new App()

    app.report('/', (req, res) => void res.send(req.method))

    const fetch = makeFetch(app.listen())

    await fetch('/', { method: 'REPORT' }).expect(200, 'REPORT')
  })
  it('app.subscribe handles subscribe request', async () => {
    const app = new App()

    app.subscribe('/', (req, res) => void res.send(req.method))

    const server = app.listen()
    const fetch = makeFetch(server)

    await fetch('/', { method: 'SUBSCRIBE' }).expect(200, 'SUBSCRIBE')
  })
  it('app.unsubscribe handles unsubscribe request', async () => {
    const app = new App()

    app.unsubscribe('/', (req, res) => void res.send(req.method))

    const server = app.listen()
    const fetch = makeFetch(server)

    await fetch('/', { method: 'UNSUBSCRIBE' }).expect(200, 'UNSUBSCRIBE')
  })
  it('app.trace handles trace request', async () => {
    const app = new App()

    app.trace('/', (req, res) => void res.send(req.method))

    const server = app.listen()
    const fetch = makeFetch(server)

    await fetch('/', { method: 'TRACE' }).expect(200, 'TRACE')
  })
})

describe('Route handlers', () => {
  it('router accepts array of middlewares', async () => {
    const app = new App()

    app.use('/', [
      (req, _, n) => {
        req.body = 'hello'
        n()
      },
      (req, _, n) => {
        req.body += ' '
        n()
      },
      (req, _, n) => {
        req.body += 'world'
        n()
      },
      (req, res) => {
        res.send(req.body)
      }
    ])

    const server = app.listen()

    const fetch = makeFetch(server)

    await fetch('/').expect(200, 'hello world')
  })
  it('router accepts path as array of middlewares', async () => {
    const app = new App()

    app.use([
      (req, _, n) => {
        req.body = 'hello'
        n()
      },
      (req, _, n) => {
        req.body += ' '
        n()
      },
      (req, _, n) => {
        req.body += 'world'
        n()
      },
      (req, res) => {
        res.send(req.body)
      }
    ])

    const server = app.listen()

    const fetch = makeFetch(server)

    await fetch('/').expect(200, 'hello world')
  })
  it('router accepts list of middlewares', async () => {
    const app = new App()

    app.use(
      (req, _, n) => {
        req.body = 'hello'
        n()
      },
      (req, _, n) => {
        req.body += ' '
        n()
      },
      (req, _, n) => {
        req.body += 'world'
        n()
      },
      (req, res) => {
        res.send(req.body)
      }
    )

    const server = app.listen()

    const fetch = makeFetch(server)

    await fetch('/').expect(200, 'hello world')
  })
  it('router accepts array of wares', async () => {
    const app = new App()

    app.get(
      '/',
      [
        (req, _, n) => {
          req.body = 'hello'
          n()
        }
      ],
      [
        (req, _, n) => {
          req.body += ' '
          n()
        }
      ],
      [
        (req, _, n) => {
          req.body += 'world'
          n()
        },
        (req, res) => {
          res.send(req.body)
        }
      ]
    )

    const server = app.listen()

    const fetch = makeFetch(server)

    await fetch('/').expect(200, 'hello world')
  })
  it('router methods do not match loosely', async () => {
    const app = new App()

    app.get('/route', (_, res) => res.send('found'))

    const server = app.listen()

    const fetch = makeFetch(server)

    await fetch('/route/subroute').expect(404)

    await fetch('/route').expect(200, 'found')
  })
})

describe('Subapps', () => {
  it('sub-app mounts on a specific path', () => {
    const app = new App()

    const subApp = new App()

    app.use('/subapp', subApp)

    expect(subApp.mountpath).toBe('/subapp')
  })
  it('sub-app mounts on root', async () => {
    const app = new App()

    const subApp = new App()

    subApp.use((_, res) => void res.send('Hello World!'))

    app.use(subApp)

    const server = app.listen()

    const fetch = makeFetch(server)

    await fetch('/').expect(200, 'Hello World!')
  })
  it('sub-app handles its own path', async () => {
    const app = new App()

    const subApp = new App()

    subApp.use((_, res) => void res.send('Hello World!'))

    app.use('/subapp', subApp)

    const server = app.listen()

    const fetch = makeFetch(server)

    await fetch('/subapp').expect(200, 'Hello World!')
  })
  it('sub-app paths get prefixed with the mount path', async () => {
    const app = new App()

    const subApp = new App()

    subApp.get('/route', (_, res) => res.send(`Hello from ${subApp.mountpath}`))

    app.use('/subapp', subApp)

    const server = app.listen()

    const fetch = makeFetch(server)

    await fetch('/subapp/route').expect(200, 'Hello from /subapp')
  })
  it('sub-app gets mounted via `app.route`', async () => {
    const app = new App()

    app.route('/path').get((_, res) => res.send('Hello World'))
  })
  /*   it('req.originalUrl does not change', async () => {
    const app = new App()

    const subApp = new App()

    subApp.get('/route', (req, res) =>
      res.send({
        origUrl: req.originalUrl,
        url: req.url,
        path: req.path
      })
    )

    app.use('/subapp', subApp)

    const server = app.listen()

    const fetch = makeFetch(server)

    await fetch('/subapp/route').expect(200, {
      origUrl: '/subapp/route',
      url: '/route',
      path: '/route'
    })
  }) */
  it('lets other wares handle the URL if subapp doesnt have that path', async () => {
    const app = new App()

    const subApp = new App()

    subApp.get('/route', (_, res) => res.send(subApp.mountpath))

    app.use('/test', subApp)

    app.use('/test3', (req, res) => res.send(req.url))

    const server = app.listen()

    const fetch = makeFetch(server)

    await fetch('/test/route').expect(200, '/test')

    await fetch('/test3/abc').expect(200, '/abc')
  })
})

describe('Template engines', () => {
  it('Works with eta out of the box', async () => {
    const app = new App<EtaConfig>()

    app.engine('eta', renderFile)

    app.use((_, res) => {
      res.render(
        'index.eta',
        {
          name: 'Eta'
        },
        {
          viewsFolder: `${process.cwd()}/__tests__/fixtures/views`
        }
      )
    })

    const server = app.listen()

    const fetch = makeFetch(server)

    await fetch('/').expectBody('Hello from Eta')
  })
})

describe('App settings', () => {
  describe('xPoweredBy', () => {
    it('is enabled by default', () => {
      const app = new App()

      expect(app.settings.xPoweredBy).toBe(true)
    })
    it('should set X-Powered-By to "tinyhttp"', async () => {
      const app = new App()

      app.use((_req, res) => void res.send('hi'))

      const server = app.listen()

      const fetch = makeFetch(server)

      await fetch('/').expectHeader('X-Powered-By', 'tinyhttp')
    })
  })
  describe('bindAppToReqRes', () => {
    it('references the current app instance in req.app and res.app', async () => {
      const app = new App({
        settings: {
          bindAppToReqRes: true
        }
      })

      app.locals['hello'] = 'world'

      app.use((req, res) => {
        expect(req.app).toBeInstanceOf(App)
        expect(res.app).toBeInstanceOf(App)
        expect(req.app.locals['hello']).toBe('world')
        expect(res.app.locals['hello']).toBe('world')
        res.end()
      })

      const server = app.listen()

      await makeFetch(server)('/').expect(200)
    })
  })
})
