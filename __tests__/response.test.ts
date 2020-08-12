import { InitAppAndTest } from './app.test'

describe('Response properties', () => {
  it('should have default HTTP Response properties', (done) => {
    const { request } = InitAppAndTest((_req, res) => {
      res.status(200).json({
        statusCode: res.statusCode,
        chunkedEncoding: res.chunkedEncoding,
      })
    })

    request.get('/').expect(
      {
        statusCode: 200,
        chunkedEncoding: false,
      },
      done
    )
  })
})

describe('Response methods', () => {
  it('res.json stringifies the object', (done) => {
    const { request } = InitAppAndTest((_req, res) => {
      res.json({
        hello: 'world',
      })
    })

    request.get('/').expect(
      {
        hello: 'world',
      },
      done
    )
  })
  it('res.send sends plain text data', (done) => {
    const { request } = InitAppAndTest((_req, res) => {
      res.send('Hello world')
    })

    request.get('/').expect('Hello world', done)
  })
  it('res.send falls back to res.json when sending objects', (done) => {
    const { request } = InitAppAndTest((_req, res) => {
      res.send({ hello: 'world' })
    })

    request.get('/').expect({ hello: 'world' }, done)
  })
  it('res.status sends status', (done) => {
    const { request } = InitAppAndTest((_req, res) => {
      res.status(418).end()
    })

    request.get('/').expect(418, done)
  })
  it('res.sendStatus sends status + text', (done) => {
    const { request } = InitAppAndTest((_req, res) => {
      res.sendStatus(418)
    })

    request.get('/').expect(418, "I'm a Teapot", done)
  })
  it('res.location sends "Location" header', (done) => {
    const { request } = InitAppAndTest((_req, res) => {
      res.location('example.com').end()
    })

    request.get('/').expect('Location', 'example.com', done)
  })
  it('res.set sets headers', (done) => {
    const { request } = InitAppAndTest((_req, res) => {
      res.set('X-Header', 'Hello World').end()
    })

    request.get('/').expect('X-Header', 'Hello World', done)
  })
  it('res.send sets proper headers', (done) => {
    const { request } = InitAppAndTest((_req, res) => {
      res.send({ hello: 'world' })
    })

    request.get('/').expect('Content-Type', 'application/json').expect('Content-Length', '22', done)
  })
  it('res.links sends links', (done) => {
    const { request } = InitAppAndTest((_req, res) => {
      res
        .links({
          next: 'http://api.example.com/users?page=2',
          last: 'http://api.example.com/users?page=5',
        })
        .end()
    })

    request.get('/').expect('Link', '<http://api.example.com/users?page=2>; rel="next", <http://api.example.com/users?page=5>; rel="last"', done)
  })
  it('res.cookie sends cookies to client', (done) => {
    const { request } = InitAppAndTest((_req, res) => {
      res.cookie('Hello', 'World').end()
    })

    request.get('/').expect('Set-Cookie', 'Hello=World; Path=/', done)
  })
})
