import { cors } from '../../packages/cors/src'
import { createServer } from 'http'
import { InitAppAndTest } from '../app.test'
import supertest from 'supertest'

describe('CORS headers tests', () => {
  it('should set origin to "*" if origin=true', (done) => {
    const { request } = InitAppAndTest(cors({ origin: true }))

    request.get('/').expect('Access-Control-Allow-Origin', '*', done)
  })
  it('should set origin if it is a string', (done) => {
    const { request } = InitAppAndTest(cors({ origin: 'example.com' }))

    request.get('/').expect('Access-Control-Allow-Origin', 'example.com', done)
  })
  it('should set custom methods', (done) => {
    const { request } = InitAppAndTest(cors({ methods: ['GET'] }))

    request.get('/').expect('Access-Control-Allow-Methods', 'GET', done)
  })
  it('should send 204 when nothing is sent', (done) => {
    const app = createServer((req, res) => {
      cors({})(req, res)
    })

    const request = supertest(app)

    request.get('/').expect(204, done)
  })
})
