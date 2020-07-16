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
})
