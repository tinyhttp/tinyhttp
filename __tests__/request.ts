import { App, Request } from '../packages/app/src/index'
import supertest from 'supertest'

// From https://gist.github.com/nicbell/6081098
const compare = (obj1: any, obj2: any) => {
  //Loop through properties in object 1
  for (const p in obj1) {
    //Check property exists on both objects
    if (obj1.hasOwnProperty(p) !== obj2.hasOwnProperty(p)) return false

    switch (typeof obj1[p]) {
      //Deep compare objects
      case 'object':
        if (!compare(obj1[p], obj2[p])) return false
        break
      //Compare function code
      case 'function':
        if (typeof obj2[p] == 'undefined' || (p != 'compare' && obj1[p].toString() != obj2[p].toString())) return false
        break
      //Compare values
      default:
        if (obj1[p] != obj2[p]) return false
    }
  }

  //Check object 2 for any extra properties
  for (const p in obj2) {
    if (typeof obj1[p] == 'undefined') return false
  }
  return true
}

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
  it('req.app should equal the app itself', done => {
    const app = new App()

    app.use((req, res) => void res.send(`req.app equals app: ${compare(app, req.app) ? 'yes' : 'no'}`))

    const server = app.listen()

    const request: any = supertest(server)

    request
      .get('/')
      .expect(200, `req.app equals app: yes`)
      .end((err: Error) => {
        server.close()
        if (err) return done(err)
        done()
      })
  })
  it('query params are being parsed properly', done => {
    const app = new App()

    app.use((req, res) => void res.send(req.query))

    const server = app.listen()

    const request: any = supertest(server)

    request
      .get('/?param1=val1&param2=val2')
      .expect(200, {
        param1: 'val1',
        param2: 'val2'
      })
      .end((err: Error) => {
        server.close()
        if (err) return done(err)
        done()
      })
  })
  it('request params are being parsed properly', done => {
    const app = new App()

    app.get('/:param1/:param2', (req, res) => void res.send(req.params))

    const server = app.listen()

    const request: any = supertest(server)

    request
      .get('/val1/val2')
      .expect(200, {
        param1: 'val1',
        param2: 'val2'
      })
      .end((err: Error) => {
        server.close()
        if (err) return done(err)
        done()
      })
  })
})
