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

    await fetch('/', { headers: { Origin: 'http://example.com' } }).expect(
      'Access-Control-Allow-Origin',
      'http://example.com'
    )
  })
  it('should set origin if it is an array', async () => {
    const { fetch } = InitAppAndTest(cors({ origin: ['http://example.com', 'example.com', 'https://example.com'] }))

    await fetch('/', { headers: { Origin: 'http://example.com' } }).expect(
      'Access-Control-Allow-Origin',
      'http://example.com'
    )
  })
  it('should send an error if it is other object types', async () => {
    // @ts-ignore: Unreachable code error
    const { fetch } = InitAppAndTest(cors({ origin: { site: 'http://example.com' } }))

    await fetch('/', { headers: { Origin: 'http://example.com' } }).expect(
      'No other objects allowed. Allowed types is array of strings or RegExp'
    )
  })
  it('should set custom methods', async () => {
    const { fetch } = InitAppAndTest(cors({ methods: ['GET'] }))

    await fetch('/').expect('Access-Control-Allow-Methods', 'GET')
  })
  it('should set custom max-age', async () => {
    const { fetch } = InitAppAndTest(cors({ maxAge: 86400 }))

    await fetch('/').expect('Access-Control-Max-Age', '86400')
  })
  it('should set custom credentials', async () => {
    const { fetch } = InitAppAndTest(cors({ credentials: true }))

    await fetch('/').expect('Access-Control-Allow-Credentials', 'true')
  })
  it('should set custom exposed headers', async () => {
    const { fetch } = InitAppAndTest(cors({ exposedHeaders: ['Content-Range', 'X-Content-Range'] }))

    await fetch('/').expect('Access-Control-Expose-Headers', 'Content-Range, X-Content-Range')
  })
  it('should set custom allowed headers', async () => {
    const { fetch } = InitAppAndTest(cors({ allowedHeaders: ['Content-Range', 'X-Content-Range'] }))

    await fetch('/').expect('Access-Control-Allow-Headers', 'Content-Range, X-Content-Range')
  })
  it('should send 204 and continue the request', async () => {
    const app = createServer((req, res) => {
      cors({
        preflightContinue: false
      })(req, res)
    })

    const fetch = makeFetch(app)

    await fetch('/', { method: 'OPTIONS' }).expectStatus(204)
  })
  it('should send 200 and continue the request', async () => {
    const app = createServer((req, res) => {
      cors({
        preflightContinue: true
      })(req, res)
      res.end('something more')
    })

    const fetch = makeFetch(app)

    await fetch('/', { method: 'OPTIONS' }).expect(200, 'something more')
  })
  it('should send 200 and continue the request', async () => {
    const app = createServer((req, res) => {
      cors({
        preflightContinue: true
      })(req, res)

      res.end('something else?')
    })

    const fetch = makeFetch(app)

    await fetch('/').expect(200, 'something else?')
  })
  it('should send 200 and continue the request', async () => {
    const app = createServer((req, res) => {
      cors()(req, res)

      res.end('something else?')
    })

    const fetch = makeFetch(app)

    await fetch('/').expectHeader('Access-Control-Allow-Origin', '*').expect(200, 'something else?')
  })
})
