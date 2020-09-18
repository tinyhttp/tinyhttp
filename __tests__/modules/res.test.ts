import { makeFetch } from 'supertest-fetch'
import { setHeader } from '../../packages/res/src'
import { runServer } from '../../test_helpers/runServer'

describe('setHeader(field, val)', () => {
  it('should set a string header with a string value', async () => {
    const app = runServer((req, res) => {
      setHeader(req, res)('hello', 'World')
      res.end()
    })

    const res = await makeFetch(app)('/')

    expect(res.headers.get('hello')).toBe('World')
  })
})
