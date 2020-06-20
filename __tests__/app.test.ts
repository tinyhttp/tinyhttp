import supertest, { SuperTest, Request, Test, Response } from 'supertest'
import { App } from '../packages/app/src'

describe('Testing App', () => {
  it('should launch a basic server', done => {
    const app = new App()

    const server = app.use((_req, res) => void res.send('Hello world')).listen()

    const request: any = supertest(server)

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

    app.use((_req, _res) => {}).use((_req, _res) => {})

    expect(app.middleware.length).toBe(2)
  })
})

describe('Testing routes', () => {
  it('should respond on matched route', done => {
    const app = new App()

    app.get('/route', (_req, res) => void res.send('Hello world'))

    const server = app.listen()

    const request: any = supertest(server)

    request
      .get('/route')
      .expect(200, 'Hello world')
      .end((err: Error) => {
        server.close()
        if (err) return done(err)
        done()
      })
  })
  it('"*" should catch all undefined routes', done => {
    const app = new App()

    app
      .get('/route', (_req, res) => void res.send('A different route'))
      .all('*', (_req, res) => void res.send('Hello world'))

    const server = app.listen()

    const request: any = supertest(server)

    request
      .get('/route')
      .expect(200, 'A different route')
      .end((err: Error) => {
        server.close()
        if (err) return done(err)
        done()
      })
  })
  it('should throw 404 on no routes', done => {
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
})
