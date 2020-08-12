import { App } from '../../packages/app/src'
import { cookieParser } from '../../packages/cookie-parser/src'
import supertest from 'supertest'

describe('Testing cookie parser middleware & it`s utilites', () => {
  it('should parse JSON cookies', (done) => {
    const app = new App()

    app.use(cookieParser())
    app.get('/', (req, res) => {
      res.json(req.cookies)
    })

    const server = app.listen()

    const request = supertest(server)

    request
      .get('/')
      .set('Cookie', 'foo=j:{"foo":"bar"}')
      .expect(200, { foo: { foo: 'bar' } }, done)
  })
  it('should get the cookie sent from client', (done) => {
    const app = new App()

    app.use(cookieParser())
    app.get('/', (req, res) => {
      res.json(req.cookies)
    })

    const server = app.listen()

    const request = supertest(server)

    request.get('/').set('Cookie', ['hello=world']).send().expect(200, { hello: 'world' }, done)
  })
})
