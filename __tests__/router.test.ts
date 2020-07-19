import supertest from 'supertest'
import { App } from '../packages/app/src'
import { InitAppAndTest } from './app.test'

describe('Testing Router', () => {
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
