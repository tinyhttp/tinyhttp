import supertest from 'supertest'
import { createServer, IncomingMessage as Request, ServerResponse as Response } from 'http'
import { json, send, sendStatus, status } from '../../packages/send/src'

const runServer = (func: (req: Request, res: Response) => any) => {
  const s = createServer((req, res) => {
    func(req, res)
  })

  return s
}

describe('Testing @tinyhttp/send', () => {
  describe('json(body)', () => {
    it('should send a json-stringified reply when an object is passed', async () => {
      const app = runServer((req, res) => json(req, res)({ hello: 'world' }))

      const res = await supertest(app).get('/')

      expect(res.body).toStrictEqual({ hello: 'world' })
    })
    it('should set a content-type header properly', async () => {
      const app = runServer((req, res) => json(req, res)({ hello: 'world' }))

      const res = await supertest(app).get('/')

      expect(res.header['content-type']).toBe('application/json')
    })
  })
  describe('send(body)', () => {
    it('should send a plain text', async () => {
      const app = runServer((req, res) => send(req, res)('Hello World'))

      const res = await supertest(app).get('/')

      expect(res.text).toBe('Hello World')
    })
    it('should set HTML content-type header when sending plain text', async () => {
      const app = runServer((req, res) => send(req, res)('Hello World'))

      const res = await supertest(app).get('/')

      expect(res.headers['content-type']).toContain('text/html')
    })
    it('should generate an eTag on a plain text response', async () => {
      const app = runServer((req, res) => send(req, res)('Hello World'))

      const res = await supertest(app).get('/')

      expect(res.header['etag']).not.toBeUndefined()
    })
  })

  describe('status(status)', () => {
    it('sets response status', async () => {
      const app = runServer((req, res) => status(req, res)(418).end())

      const res = await supertest(app).get('/')

      expect(res.status).toBe(418)
    })
  })

  describe('sendStatus(status)', () => {
    it(`should send "I'm a teapot" when argument is 418`, async () => {
      const app = runServer((req, res) => sendStatus(req, res)(418).end())

      const res = await supertest(app).get('/')

      expect(res.text).toBe("I'm a Teapot")
    })
  })
})
