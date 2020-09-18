import { makeFetch } from 'supertest-fetch'
import { json, send, sendStatus, status } from '../../packages/send/src'
import { runServer } from '../../test_helpers/runServer'

describe('Testing @tinyhttp/send', () => {
  describe('json(body)', () => {
    it('should send a json-stringified reply when an object is passed', async () => {
      const app = runServer((req, res) => json(req, res)({ hello: 'world' }))

      await makeFetch(app)('/').expect({ hello: 'world' })
    })
    it('should set a content-type header properly', async () => {
      const app = runServer((req, res) => json(req, res)({ hello: 'world' }))

      await makeFetch(app)('/').expectHeader('content-type', 'application/json')
    })
  })
  describe('send(body)', () => {
    it('should send a plain text', async () => {
      const app = runServer((req, res) => send(req, res)('Hello World'))

      await makeFetch(app)('/').expect('Hello World')
    })
    it('should set HTML content-type header when sending plain text', async () => {
      const app = runServer((req, res) => send(req, res)('Hello World'))

      const res = await makeFetch(app)('/')

      expect(res.headers.get('content-type')).toContain('text/html')
    })
    it('should generate an eTag on a plain text response', async () => {
      const app = runServer((req, res) => send(req, res)('Hello World'))

      const res = await makeFetch(app)('/')

      expect(res.headers.get('etag')).not.toBeUndefined()
    })
  })

  describe('status(status)', () => {
    it('sets response status', async () => {
      const app = runServer((req, res) => status(req, res)(418).end())

      await makeFetch(app)('/').expectStatus(418)
    })
  })

  describe('sendStatus(status)', () => {
    it(`should send "I'm a teapot" when argument is 418`, async () => {
      const app = runServer((req, res) => sendStatus(req, res)(418).end())

      await makeFetch(app)('/').expect("I'm a Teapot")
    })
  })
})
