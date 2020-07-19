import { InitAppAndTest } from './app.test'

describe('Response properties', () => {
  it('should have default HTTP Response properties', (done) => {
    const { request, server } = InitAppAndTest((_req, res) => {
      res.status(200).json({
        statusCode: res.statusCode,
        chunkedEncoding: res.chunkedEncoding,
      })
    })

    request
      .get('/')
      .expect({
        statusCode: 200,
        chunkedEncoding: false,
      })
      .end((err: Error) => {
        server.close()
        if (err) return done(err)
        done()
      })
  })
})

describe('Response methods', () => {
  it('res.json stringifies the object', (done) => {
    const { request, server } = InitAppAndTest((_req, res) => {
      res.json({
        hello: 'world',
      })
    })

    request
      .get('/')
      .expect({
        hello: 'world',
      })
      .end((err: Error) => {
        server.close()
        if (err) return done(err)
        done()
      })
  })
  it('res.send sends plain text data', (done) => {
    const { request, server } = InitAppAndTest((_req, res) => {
      res.send('Hello world')
    })

    request
      .get('/')
      .expect('Hello world')
      .end((err: Error) => {
        server.close()
        if (err) return done(err)
        done()
      })
  })
  it('res.send falls back to res.json when sending objects', (done) => {
    const { request, server } = InitAppAndTest((_req, res) => {
      res.send({ hello: 'world' })
    })

    request
      .get('/')
      .expect({ hello: 'world' })
      .end((err: Error) => {
        server.close()
        if (err) return done(err)
        done()
      })
  })
  it('res.status sends status', (done) => {
    const { request, server } = InitAppAndTest((_req, res) => {
      res.status(418).end()
    })

    request
      .get('/')
      .expect(418)
      .end((err: Error) => {
        server.close()
        if (err) return done(err)
        done()
      })
  })
  it('res.sendStatus sends status + text', (done) => {
    const { request, server } = InitAppAndTest((_req, res) => {
      res.sendStatus(418)
    })

    request
      .get('/')
      .expect(418, "I'm a Teapot")
      .end((err: Error) => {
        server.close()
        if (err) return done(err)
        done()
      })
  })
  it('res.location sends "Location" header', (done) => {
    const { request, server } = InitAppAndTest((_req, res) => {
      res.location('example.com').end()
    })

    request
      .get('/')
      .expect('Location', 'example.com')
      .end((err: Error) => {
        server.close()
        if (err) return done(err)
        done()
      })
  })
  it('res.set sets headers', (done) => {
    const { request, server } = InitAppAndTest((_req, res) => {
      res.set('X-Header', 'Hello World').end()
    })

    request
      .get('/')
      .expect('X-Header', 'Hello World')
      .end((err: Error) => {
        server.close()
        if (err) return done(err)
        done()
      })
  })
  it('res.send sets proper headers', (done) => {
    const { request, server } = InitAppAndTest((_req, res) => {
      res.send({ hello: 'world' })
    })

    request
      .get('/')
      .expect('Content-Type', 'application/json')
      .expect('Content-Length', '22')
      .end((err: Error) => {
        server.close()
        if (err) return done(err)
        done()
      })
  })
})
