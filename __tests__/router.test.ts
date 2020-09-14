import supertest from 'supertest'
import { App } from '../packages/app/src'
import { InitAppAndTest } from './app.test'

describe('Testing Router', () => {
  it('should respond on matched route', (done) => {
    const { request } = InitAppAndTest((_req, res) => void res.send('Hello world'), '/route')

    request.get('/route').expect(200, 'Hello world', done)
  })
  it('"*" should catch all undefined routes', (done) => {
    const app = new App()

    app.get('/route', (_req, res) => void res.send('A different route')).all('*', (_req, res) => void res.send('Hello world'))

    const server = app.listen()

    const request = supertest(server)

    request.get('/route').expect(200, 'A different route', done)
  })
  it('should throw 404 on no routes', (done) => {
    const app = new App()

    const server = app.listen()

    const request: any = supertest(server)

    request.get('/').expect(404, done)
  })
  it('next function skips current middleware', (done) => {
    const app = new App()

    app.locals['log'] = 'test'

    app
      .use(async (req, _res, next) => {
        app.locals['log'] = req.url
        next()
      })
      .use((_req, res) => void res.json({ ...app.locals }))

    const server = app.listen()

    const request: any = supertest(server)

    request.get('/').expect(200, { log: '/' }, done)
  })
  it('next function handles errors', (done) => {
    const app = new App()

    app.use((req, res, next) => {
      if (req.url === '/broken') {
        next('Your appearance destroyed this world.')
      } else {
        res.send('Welcome back')
      }
    })

    const server = app.listen()

    const request: any = supertest(server)

    request.get('/broken').expect(500, 'Your appearance destroyed this world.', done)
  })
})

describe('Route methods', () => {
  it('app.get handles get request', (done) => {
    const app = new App()

    app.get('/', (req, res) => void res.send(req.method))

    const server = app.listen()
    const request = supertest(server)

    request.get('/').expect(200, 'GET', done)
  })
  it('app.post handles post request', (done) => {
    const app = new App()

    app.post('/', (req, res) => void res.send(req.method))

    const server = app.listen()
    const request = supertest(server)

    request
      .post('/')
      .expect(200, 'POST')
      .end((err: Error) => {
        server.close()
        if (err) return done(err)
        done()
      })
  })
  it('app.put handles put request', (done) => {
    const app = new App()

    app.put('/', (req, res) => void res.send(req.method))

    const server = app.listen()
    const request = supertest(server)

    request
      .put('/')
      .expect(200, 'PUT')
      .end((err: Error) => {
        server.close()
        if (err) return done(err)
        done()
      })
  })
  it('app.patch handles patch request', (done) => {
    const app = new App()

    app.patch('/', (req, res) => void res.send(req.method))

    const server = app.listen()
    const request = supertest(server)

    request
      .patch('/')
      .expect(200, 'PATCH')
      .end((err: Error) => {
        server.close()
        if (err) return done(err)
        done()
      })
  })
  it('app.head handles head request', (done) => {
    const app = new App()

    app.head('/', (req, res) => void res.end(req.method))

    const server = app.listen()
    const request = supertest(server)

    request.head('/').expect(200, '' || undefined, done)
  })
  it('app.delete handles delete request', (done) => {
    const app = new App()

    app.delete('/', (req, res) => void res.send(req.method))

    const server = app.listen()
    const request = supertest(server)

    request.delete('/').expect(200, 'DELETE', done)
  })
  it('app.checkout handles checkout request', (done) => {
    const app = new App()

    app.checkout('/', (req, res) => void res.send(req.method))

    const server = app.listen()
    const request = supertest(server)

    request
      .checkout('/')
      .expect(200, 'CHECKOUT')
      .end((err: Error) => {
        server.close()
        if (err) return done(err)
        done()
      })
  })
  it('app.copy handles copy request', (done) => {
    const app = new App()

    app.copy('/', (req, res) => void res.send(req.method))

    const server = app.listen()
    const request = supertest(server)

    request
      .copy('/')
      .expect(200, 'COPY')
      .end((err: Error) => {
        server.close()
        if (err) return done(err)
        done()
      })
  })
  it('app.lock handles lock request', (done) => {
    const app = new App()

    app.lock('/', (req, res) => void res.send(req.method))

    const server = app.listen()
    const request = supertest(server)

    request
      .lock('/')
      .expect(200, 'LOCK')
      .end((err: Error) => {
        server.close()
        if (err) return done(err)
        done()
      })
  })
  it('app.merge handles merge request', (done) => {
    const app = new App()

    app.merge('/', (req, res) => void res.send(req.method))

    const server = app.listen()
    const request = supertest(server)

    request
      .merge('/')
      .expect(200, 'MERGE')
      .end((err: Error) => {
        server.close()
        if (err) return done(err)
        done()
      })
  })
  it('app.mkactivity handles mkactivity request', (done) => {
    const app = new App()

    app.mkactivity('/', (req, res) => void res.send(req.method))

    const server = app.listen()
    const request = supertest(server)

    request
      .mkactivity('/')
      .expect(200, 'MKACTIVITY')
      .end((err: Error) => {
        server.close()
        if (err) return done(err)
        done()
      })
  })
  it('app.mkcol handles mkcol request', (done) => {
    const app = new App()

    app.mkcol('/', (req, res) => void res.send(req.method))

    const server = app.listen()
    const request = supertest(server)

    request
      .mkcol('/')
      .expect(200, 'MKCOL')
      .end((err: Error) => {
        server.close()
        if (err) return done(err)
        done()
      })
  })
  it('app.move handles move request', (done) => {
    const app = new App()

    app.move('/', (req, res) => void res.send(req.method))

    const server = app.listen()
    const request = supertest(server)

    request
      .move('/')
      .expect(200, 'MOVE')
      .end((err: Error) => {
        server.close()
        if (err) return done(err)
        done()
      })
  })
  it('app.search handles search request', (done) => {
    const app = new App()

    app.search('/', (req, res) => void res.send(req.method))

    const server = app.listen()
    const request = supertest(server)

    request
      .search('/')
      .expect(200, 'SEARCH')
      .end((err: Error) => {
        server.close()
        if (err) return done(err)
        done()
      })
  })
  it('app.notify handles notify request', (done) => {
    const app = new App()

    app.notify('/', (req, res) => void res.send(req.method))

    const server = app.listen()
    const request = supertest(server)

    request
      .notify('/')
      .expect(200, 'NOTIFY')
      .end((err: Error) => {
        server.close()
        if (err) return done(err)
        done()
      })
  })
  it('app.purge handles purge request', (done) => {
    const app = new App()

    app.purge('/', (req, res) => void res.send(req.method))

    const server = app.listen()
    const request = supertest(server)

    request
      .purge('/')
      .expect(200, 'PURGE')
      .end((err: Error) => {
        server.close()
        if (err) return done(err)
        done()
      })
  })
  it('app.report handles report request', (done) => {
    const app = new App()

    app.report('/', (req, res) => void res.send(req.method))

    const server = app.listen()
    const request = supertest(server)

    request
      .report('/')
      .expect(200, 'REPORT')
      .end((err: Error) => {
        server.close()
        if (err) return done(err)
        done()
      })
  })
  it('app.subscribe handles subscribe request', (done) => {
    const app = new App()

    app.subscribe('/', (req, res) => void res.send(req.method))

    const server = app.listen()
    const request = supertest(server)

    request
      .subscribe('/')
      .expect(200, 'SUBSCRIBE')
      .end((err: Error) => {
        server.close()
        if (err) return done(err)
        done()
      })
  })
  it('app.unsubscribe handles unsubscribe request', (done) => {
    const app = new App()

    app.unsubscribe('/', (req, res) => void res.send(req.method))

    const server = app.listen()
    const request = supertest(server)

    request
      .unsubscribe('/')
      .expect(200, 'UNSUBSCRIBE')
      .end((err: Error) => {
        server.close()
        if (err) return done(err)
        done()
      })
  })
  it('app.trace handles trace request', (done) => {
    const app = new App()

    app.trace('/', (req, res) => void res.send(req.method))

    const server = app.listen()
    const request = supertest(server)

    request
      .trace('/')
      .expect(200, 'TRACE')
      .end((err: Error) => {
        server.close()
        if (err) return done(err)
        done()
      })
  })
})

describe('Route handlers', () => {
  it('router accepts array of middlewares', (done) => {
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

    const request = supertest(server)

    request
      .get('/')
      .expect(200, 'hello world')
      .end((err: Error) => {
        server.close()
        if (err) return done(err)
        done()
      })
  })
  it('router accepts path as array of middlewares', (done) => {
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

    const request = supertest(server)

    request
      .get('/')
      .expect(200, 'hello world')
      .end((err: Error) => {
        server.close()
        if (err) return done(err)
        done()
      })
  })
  it('sub-app mounts on a specific path', () => {
    const app = new App()

    const subApp = new App()

    app.use('/subapp', subApp)

    expect(subApp.mountpath).toBe('/subapp')
  })
  it('sub-app handles its own path', (done) => {
    const app = new App()

    const subApp = new App()

    subApp.use((_, res) => void res.send('Hello World!'))

    app.use('/subapp', subApp)

    const server = app.listen()

    const request = supertest(server)

    request.get('/subapp').expect(200, 'Hello World!', done)
  })
  it('sub-app paths get prefixed with the mount path', (done) => {
    const app = new App()

    const subApp = new App()

    subApp.get('/route', (_, res) => res.send(`Hello from ${subApp.mountpath}`))

    app.use('/subapp', subApp)

    const server = app.listen()

    const request = supertest(server)

    request.get('/subapp/route').expect(200, 'Hello from /subapp', done)
  })
})
