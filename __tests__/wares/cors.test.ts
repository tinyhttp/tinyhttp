import { cors } from '../../packages/cors/src'
import { createServer } from 'http'
import { InitAppAndTest } from '../../test_helpers/initAppAndTest'
import { makeFetch } from 'supertest-fetch'

describe('CORS headers tests', () => {
  it('should set origin to "*" if origin=true', async () => {
    const { fetch } = InitAppAndTest(cors({ origin: true }))

    await fetch('/').expect('Access-Control-Allow-Origin', '*')
  })
  it('should set origin if it is a string', async () => {
    const { fetch } = InitAppAndTest(cors({ origin: 'example.com' }))

    await fetch('/').expect('Access-Control-Allow-Origin', 'example.com')
  })
  it('should set origin if it is a function', async () => {
    const { fetch } = InitAppAndTest(cors({ origin: () => 'example.com' }))

    await fetch('/').expect('Access-Control-Allow-Origin', 'example.com')
  })
  it('should set origin if it is a regex', async () => {
    const { fetch } = InitAppAndTest(cors({ origin: /(?:http:\/\/)?example.com/ }))

    await fetch('/', { headers: { Origin: 'http://example.com' } }).expect('Access-Control-Allow-Origin', 'http://example.com')
  })
  it('should set origin if it is an array', async () => {
    const { fetch } = InitAppAndTest(cors({ origin: ['http://example.com', 'example.com', 'https://example.com'] }))

    await fetch('/', { headers: { Origin: 'http://example.com' } }).expect('Access-Control-Allow-Origin', 'http://example.com')
  })
  it('should send an error if it is other object types', async () => {
    // @ts-ignore: Unreachable code error
    const { fetch } = InitAppAndTest(cors({ origin: { site: 'http://example.com'} }))

    await fetch('/', { headers: { Origin: 'http://example.com' } }).expect('No other objects allowed. Allowed types is array of strings or RegExp')
  })
  it('should set custom methods', async () => {
    const { fetch } = InitAppAndTest(cors({ methods: ['GET'] }))

    await fetch('/').expect('Access-Control-Allow-Methods', 'GET')
  })
  it('should send 204 and finish the request', async () => {
    const app = createServer((req, res) => {
      cors({
        preflightContinue: false
      })(req, res)
    })

    const fetch = makeFetch(app)

    await fetch('/').expect(204)
  })
  it('should send 204 and continue the request', async () => {
    const app = createServer((req, res) => {
      cors({
        preflightContinue: true
      })(req, res)

      res.end('something else?')
    })

    const fetch = makeFetch(app)

    await fetch('/').expect(200, 'something else?')
  })
  it('should send 204 and continue the request', async () => {
    const app = createServer((req, res) => {
      cors()(req, res)

      res.end('something else?')
    })

    const fetch = makeFetch(app)

    await fetch('/').expectHeader('Access-Control-Allow-Origin', '*').expect(200, 'something else?')
  })
})
