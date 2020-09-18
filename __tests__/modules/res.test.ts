import { makeFetch } from 'supertest-fetch'
import { getResponseHeader, setHeader } from '../../packages/res/src'
import { runServer } from '../../test_helpers/runServer'

describe('Response extensions', () => {
  describe('setHeader(field, val)', () => {
    it('should set a string header with a string value', async () => {
      const app = runServer((req, res) => {
        setHeader(req, res)('hello', 'World')
        res.end()
      })

      await makeFetch(app)('/').expectHeader('hello', 'World')
    })
    it('should set an array of header values', async () => {
      const app = runServer((req, res) => {
        setHeader(req, res)('foo', ['bar', 'baz'])
        res.end()
      })

      await makeFetch(app)('/').expectHeader('foo', 'bar, baz')
    })
    it('should throw if `Content-Type` header is passed as an array', () => {
      try {
        runServer((req, res) => {
          setHeader(req, res)('content-type', ['foo', 'bar'])
          res.end()
        })
      } catch (e) {
        expect((e as TypeError).message).toBe('Content-Type cannot be set to an Array')
      }
    })
    it('if the first argument is object, then map keys to values', async () => {
      const app = runServer((req, res) => {
        setHeader(req, res)({ foo: 'bar' })
        res.end()
      })

      await makeFetch(app)('/').expectHeader('foo', 'bar')
    })
  })
  describe('getHeader(field)', () => {
    it('should get a header with a specified field', async () => {
      const app = runServer((req, res) => {
        setHeader(req, res)('hello', 'World')
        res.end(getResponseHeader(req, res)('hello'))
      })

      await makeFetch(app)('/').expect('World')
    })
  })
})
