import { App } from '../../packages/app/src'
import { cookieParser } from '../../packages/cookie-parser/src'
import supertest from 'supertest'

describe('Testing cookie parser middleware', () => {
  it('should get the cookie sent from client', (done) => {
    const app = new App()

    app.use(cookieParser())
    app.get('/', (req, res) => {
      res.json(req.cookies)
    })

    const server = app.listen()

    const request = supertest(server)

    request
      .get('/')
      .set('Cookie', ['hello=world'])
      .send()
      .expect(200, { hello: 'world' })
      .end((err: Error) => {
        server.close()
        if (err) return done(err)
        done()
      })
  })
})
