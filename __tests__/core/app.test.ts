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

    app
      .use(function (_req, _res, next) {
        next()
      })
      .use((_req, _res, next) => {
        next()
      })

    expect(app.middleware.length).toBe(2)
  })
  it('app.locals are get and set', () => {
    const app = new App()

    app.locals.hello = 'world'

    expect(app.locals.hello).toBe('world')
  })
  it('Custom noMatchHandler works', async () => {
    const app = new App({
      noMatchHandler: (req, res) => res.status(404).end(`Oopsie! Page ${req.url} is lost.`),
    })

    const server = app.listen()

    const fetch = makeFetch(server)

    await fetch('/').expect(404, 'Oopsie! Page / is lost.')
  })
  it('Custom onError works', async () => {
    const app = new App({
      onError: (err, req, res) => res.status(500).end(`Ouch, ${err} hurt me on ${req.url} page.`),
    })

    app.use((_req, _res, next) => {
      next('you')
    })

    const server = app.listen()
    const fetch = makeFetch(server)

    await fetch('/').expect(500, 'Ouch, you hurt me on / page.')
  })

  it('App works with HTTP 1.1', async () => {
    const app = new App()

    const server = http.createServer()

    server.on('request', (req, res) => app.handler(req, res))

    const fetch = makeFetch(server)

    await fetch('/').expect(404)
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
      .use((req, res) => {
        res.send(req.body.toString())
      })

    const server = app.listen()

    const fetch = makeFetch(server)

    await fetch('/').expect(200, 'I am a text file.')
  })
})

describe('Testing App routing', () => {
  it('should respond on matched route', async () => {
    const { fetch } = InitAppAndTest((_req, res) => void res.send('Hello world'), '/route')

    await fetch('/route').expect(200, 'Hello world')
  })
  it('"*" should catch all undefined routes', async () => {
    const app = new App()

    app.get('/route', (_req, res) => void res.send('A different route')).all('*', (_req, res) => void res.send('Hello world'))

    await makeFetch(app.listen())('/route').expect(200, 'A different route')
  })
  it('should throw 404 on no routes', async () => {
    await makeFetch(new App().listen())('/').expect(404)
  })
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
})

describe('Route methods', () => {
  it('app.get handles get request', async () => {
    const app = new App()

    app.get('/', (req, res) => void res.send(req.method))

    await makeFetch(app.listen())('/').expect(200, 'GET')
  })
  it('app.post handles post request', async () => {
    const { fetch } = InitAppAndTest((req, res) => void res.send(req.method), '/', 'POST')

    await fetch('/', {
      method: 'POST',
    }).expect(200, 'POST')
  })
  it('app.put handles put request', async () => {
    const { fetch } = InitAppAndTest((req, res) => void res.send(req.method), '/', 'PUT')

    await fetch('/', {
      method: 'PUT',
    }).expect(200, 'PUT')
  })
  it('app.patch handles patch request', async () => {
    const { fetch } = InitAppAndTest((req, res) => void res.send(req.method), '/', 'PATCH')

    await fetch('/', { method: 'PATCH' }).expect(200, 'PATCH')
  })
  it('app.head handles head request', async () => {
    const app = new App()

    app.head('/', (req, res) => void res.end(req.method))

    const server = app.listen()
    const fetch = makeFetch(server)

    await fetch('/', { method: 'HEAD' }).expect(200, '' || undefined)
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

    const server = app.listen()
    const fetch = makeFetch(server)

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
      function m1(req, _, n) {
        req.body = ''
        n()
      },
      function m2(req, _, n) {
        req.body += 'hello'
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
      },
    ])

    const server = app.listen()

    const fetch = makeFetch(server)

    await fetch('/').expect(200, 'hello world')
  })
  it('router accepts path as array of middlewares', async () => {
    const app = new App()

    app.use([
      function m1(req, _, n) {
        req.body = ''
        n()
      },
      function m2(req, _, n) {
        req.body += 'hello'
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
      },
    ])

    const server = app.listen()

    const fetch = makeFetch(server)

    await fetch('/').expect(200, 'hello world')
  })
  it('sub-app mounts on a specific path', () => {
    const app = new App()

    const subApp = new App()

    app.use('/subapp', subApp)

    expect(subApp.mountpath).toBe('/subapp')
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
})

describe('Template engines', () => {
  it('Works with eta out of the box', async () => {
    const app = new App<EtaConfig>()

    app.engine('eta', renderFile)

    app.use((_, res) => {
      res.render(
        'index.eta',
        {
          name: 'Eta',
        },
        {
          viewsFolder: `${process.cwd()}/__tests__/fixtures/views`,
        }
      )
    })

    const server = app.listen()

    const fetch = makeFetch(server)

    await fetch('/').expectBody('Hello from Eta')
  })
})
