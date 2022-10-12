import { describe, expect, it, beforeAll, afterAll } from 'vitest'
import fs from 'fs'
import path from 'path'
import { makeFetch } from 'supertest-fetch'
import { App } from '../../packages/app/src'
import { json, send, sendFile, sendStatus, status } from '../../packages/send/src'
import { runServer } from '../../test_helpers/runServer'
import { dirname } from 'dirname-filename-esm'

const __dirname = dirname(import.meta)

describe('json(body)', () => {
  it('should send a json-stringified reply when an object is passed', async () => {
    const app = runServer((_, res) => json(res)({ hello: 'world' }))

    await makeFetch(app)('/').expect({ hello: 'world' })
  })
  it('should set a content-type header properly', async () => {
    const app = runServer((_, res) => json(res)({ hello: 'world' }))

    await makeFetch(app)('/').expectHeader('content-type', 'application/json')
  })
  it('should send a null reply when an null is passed', async () => {
    const app = runServer((_, res) => json(res)(null))

    await makeFetch(app)('/').expect(null)
  })
})

describe('send(body)', () => {
  it('should send a plain text', async () => {
    const app = runServer((req, res) => send(req, res)('Hello World'))

    await makeFetch(app)('/').expect('Hello World')
  })
  it('should set HTML content-type header when sending plain text', async () => {
    const app = runServer((req, res) => send(req, res)('Hello World'))

    await makeFetch(app)('/').expectHeader('Content-Type', 'text/html; charset=utf-8')
  })
  it('should generate an eTag on a plain text response', async () => {
    const app = runServer((req, res) => send(req, res)('Hello World'))

    await makeFetch(app)('/').expectHeader('etag', 'W/"b-Ck1VqNd45QIvq3AZd8XYQLvEhtA"')
  })
  it('should send a JSON response', async () => {
    const app = runServer((req, res) => send(req, res)({ hello: 'world' }))

    await makeFetch(app)('/').expectHeader('Content-Type', 'application/json').expectBody({ hello: 'world' })
  })
  it('should send a buffer', async () => {
    const app = runServer((req, res) => send(req, res)(Buffer.from('Hello World')))

    await makeFetch(app)('/').expect('Hello World')
  })
  it('should send nothing on a HEAD request', async () => {
    const app = runServer((req, res) => send(req, res)('Hello World'))

    await makeFetch(app)('/', {
      method: 'HEAD'
    }).expectBody('')
  })
  it('should send nothing if body is empty', async () => {
    const app = runServer((req, res) => send(req, res)(null))

    await makeFetch(app)('/').expectBody('')
  })
  it('should remove some headers for 204 status', async () => {
    const app = runServer((req, res) => {
      res.statusCode = 204

      send(req, res)('Hello World')
    })

    await makeFetch(app)('/')
      .expectHeader('Content-Length', null)
      .expectHeader('Content-Type', null)
      .expectHeader('Transfer-Encoding', null)
  })
  it('should remove some headers for 304 status', async () => {
    const app = runServer((req, res) => {
      res.statusCode = 304

      send(req, res)('Hello World')
    })

    await makeFetch(app)('/')
      .expectHeader('Content-Length', null)
      .expectHeader('Content-Type', null)
      .expectHeader('Transfer-Encoding', null)
  })
  it("should set Content-Type to application/octet-stream for buffers if the header hasn't been set before", async () => {
    const app = runServer((req, res) => send(req, res)(Buffer.from('Hello World', 'utf-8')).end())

    await makeFetch(app)('/', { headers: { 'Content-Type': null } }).expectHeader(
      'Content-Type',
      'application/octet-stream'
    )
  })
  it('should set 304 status for fresh requests', async () => {
    const etag = 'abc'

    const app = new App()

    const server = app.listen()

    app.use((_req, res) => {
      const str = Array(1000).join('-')
      res.set('ETag', etag).send(str)
    })

    await makeFetch(server)('/', {
      headers: {
        'If-None-Match': etag
      }
    }).expectStatus(304)
  })
})

describe('status(status)', () => {
  it('sets response status', async () => {
    const app = runServer((_, res) => status(res)(418).end())

    await makeFetch(app)('/').expectStatus(418)
  })
  it('supports nesting', async () => {
    const app = runServer((_, res) => {
      const r = status(res)(418)

      expect(r).toBe(res)

      r.end()
    })

    await makeFetch(app)('/').expectStatus(418)
  })
})

describe('sendStatus(status)', () => {
  it(`should send "I'm a teapot" when argument is 418`, async () => {
    const app = runServer((req, res) => sendStatus(req, res)(418).end())

    await makeFetch(app)('/').expect("I'm a Teapot")
  })
})

describe('sendFile(path)', () => {
  const testFilePath = path.resolve(__dirname, 'test.txt')

  beforeAll(() => {
    fs.writeFileSync(testFilePath, 'Hello World')
  })

  afterAll(() => {
    fs.unlinkSync(testFilePath)
  })

  it('should send the file', async () => {
    const app = runServer((req, res) => sendFile(req, res)(testFilePath, {}))

    await makeFetch(app)('/').expect('Hello World')
  })

  it('should throw if path is not absolute', async () => {
    const app = runServer(async (req, res) => {
      try {
        sendFile(req, res)('../relative/path', {})
      } catch (err) {
        expect(err.message).toMatch(/absolute/)

        res.end()

        return
      }

      throw new Error('Did not throw an error')
    })

    await makeFetch(app)('/')
  })
  it('should set the Content-Type header based on the filename', async () => {
    const app = runServer((req, res) => sendFile(req, res)(testFilePath, {}))

    await makeFetch(app)('/').expectHeader('Content-Type', 'text/plain; charset=utf-8')
  })
  it('should inherit the previously set Content-Type header', async () => {
    const app = runServer((req, res) => {
      res.setHeader('Content-Type', 'text/markdown')

      sendFile(req, res)(testFilePath, {})
    })

    await makeFetch(app)('/').expectHeader('Content-Type', 'text/markdown')
  })
  it('should allow custom headers through the options param', async () => {
    const HEADER_NAME = 'Test-Header'
    const HEADER_VALUE = 'Hello World'

    const app = runServer((req, res) => sendFile(req, res)(testFilePath, { headers: { [HEADER_NAME]: HEADER_VALUE } }))

    await makeFetch(app)('/').expectHeader(HEADER_NAME, HEADER_VALUE)
  })

  it('should support Range header', async () => {
    const app = runServer((req, res) => sendFile(req, res)(testFilePath))
    await makeFetch(app)('/', {
      headers: {
        Range: 'bytes=0-4'
      }
    })
      .expectStatus(206)
      .expect('Content-Length', '5')
      .expect('Accept-Ranges', 'bytes')
      .expect('Hello')
  })
  it('should send 419 if out of range', async () => {
    const app = runServer((req, res) => sendFile(req, res)(testFilePath))
    await makeFetch(app)('/', {
      headers: {
        Range: 'bytes=0-666'
      }
    })
      .expectStatus(416)
      .expectHeader('Content-Range', 'bytes */11')
  })
  it('should set default encoding to UTF-8', async () => {
    const app = runServer((req, res) => sendFile(req, res)(testFilePath))
    await makeFetch(app)('/').expectStatus(200).expectHeader('Content-Encoding', 'utf-8')
  })
  it('should inherit the previously set status code', async () => {
    const app = runServer((req, res) => {
      res.statusCode = 418
      sendFile(req, res)(testFilePath)
    })

    await makeFetch(app)('/').expectStatus(418)
  })
})
