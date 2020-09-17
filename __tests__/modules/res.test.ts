import supertest from 'supertest'
import { setHeader } from '../../packages/res/src'
import { runServer } from '../helpers/runServer'

describe('setHeader(field, val)', () => {
  it('should set a string header with a string value', async () => {
    const app = runServer((req, res) => {
      setHeader(req, res)('hello', 'World')
      res.end()
    })

    const res = await supertest(app).get('/')

    expect(res.headers['hello']).toBe('World')
  })
})
