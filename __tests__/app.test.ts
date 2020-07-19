import supertest from 'supertest'
import http from 'http'
import { App, Handler } from '../packages/app/src'

export const InitAppAndTest = (handler: Handler, route?: string, method = 'get') => {
  const app = new App()

  if (route) {
    app[method](route, handler)
  } else {
    app.use(handler)
  }

  const server = app.listen()

  const request = supertest(server)

  return { request, server }
}

describe('Testing App', () => {
  it('should launch a basic server', (done) => {
    const { request, server } = InitAppAndTest((_req, res) => void res.send('Hello world'))

    request
      .get('/')
      .expect(200, 'Hello world')
      .end((err: Error) => {
        server.close()
        if (err) return done(err)
        done()
      })
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
  it('Custom noMatchHandler works', (done) => {
    const app = new App({
      noMatchHandler: (req, res) => res.status(404).end(`Oopsie! Page ${req.url} is lost.`),
    })

    const server = app.listen()

    const request = supertest(server)

    request
      .get('/')
      .expect(404, 'Oopsie! Page / is lost.')
      .end((err: Error) => {
        server.close()
        if (err) return done(err)
        done()
      })
  })
  it('App works with HTTP 1.1', (done) => {
    const app = new App()

    const server = http.createServer(app.handler)

    const request = supertest(server)

    request
      .get('/')
      .expect(404)
      .end((err: Error) => {
        server.close()
        if (err) return done(err)
        done()
      })
  })
})

describe('Testing routes', () => {
  it('should respond on matched route', (done) => {
    const { request, server } = InitAppAndTest((_req, res) => void res.send('Hello world'), '/route')

    request
      .get('/route')
      .expect(200, 'Hello world')
      .end((err: Error) => {
        server.close()
        if (err) return done(err)
        done()
      })
  })
  it('"*" should catch all undefined routes', (done) => {
    const app = new App()

    app.get('/route', (_req, res) => void res.send('A different route')).all('*', (_req, res) => void res.send('Hello world'))

    const server = app.listen()

    const request = supertest(server)

    request
      .get('/route')
      .expect(200, 'A different route')
      .end((err: Error) => {
        server.close()
        if (err) return done(err)
        done()
      })
  })
  it('should throw 404 on no routes', (done) => {
    const app = new App()

    const server = app.listen()

    const request: any = supertest(server)

    request
      .get('/')
      .expect(404)
      .end((err: Error) => {
        server.close()
        if (err) return done(err)
        done()
      })
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

    request
      .get('/')
      .expect(200, { log: '/' })
      .end((err: Error) => {
        server.close()
        if (err) return done(err)
        done()
      })
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

    request
      .get('/broken')
      .expect(500, 'Your appearance destroyed this world.')
      .end((err: Error) => {
        server.close()
        if (err) return done(err)
        done()
      })
  })
})
