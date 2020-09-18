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
  it('should set custom methods', async () => {
    const { fetch } = InitAppAndTest(cors({ methods: ['GET'] }))

    await fetch('/').expect('Access-Control-Allow-Methods', 'GET')
  })
  it('should send 204 when nothing is sent', async () => {
    const app = createServer((req, res) => {
      cors({})(req, res)
    })

    const fetch = makeFetch(app)

    await fetch('/').expect(204)
  })
})
