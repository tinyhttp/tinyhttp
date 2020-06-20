import { App, Request } from '../packages/app/src'
import supertest from 'supertest'

describe('Request extensions', () => {
  it('should have default HTTP Request properties', done => {
    const app = new App()

    app.get('/', (req: Request, res) => {
      res.status(200).json({
        url: req.url,
        complete: req.complete
      })
    })

    const server = app.listen()

    const request: any = supertest(server)

    request
      .get('/')
      .expect(200, { url: '/', complete: false })
      .end((err: Error) => {
        server.close()
        if (err) return done(err)
        done()
      })
  })
})
