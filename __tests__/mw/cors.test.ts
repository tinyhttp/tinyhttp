import { cors } from '../../packages/cors/src'
import { InitAppAndTest } from '../app.test'

describe('CORS headers tests', () => {
  it('should set origin to "*" if origin=true', (done) => {
    const { request } = InitAppAndTest(cors({ origin: true }))

    request.get('/').expect('Access-Control-Allow-Origin', '*', done)
  })
  it('should set origin if it is a string', (done) => {
    const { request } = InitAppAndTest(cors({ origin: 'example.com' }))

    request.get('/').expect('Access-Control-Allow-Origin', 'example.com', done)
  })
})
