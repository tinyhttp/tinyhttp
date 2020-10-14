import { makeFetch } from 'supertest-fetch'
import { checkIfXMLHttpRequest, getAccepts, getFreshOrStale, getRequestHeader, getRangeFromHeader, reqIs } from '../../packages/req/src'
import { Ranges } from 'range-parser'
import { runServer } from '../../test_helpers/runServer'

describe('Request extensions', () => {
  describe('req.get(header)', () => {
    it('should return a specified header', async () => {
      const app = runServer((req, res) => {
        res.end(getRequestHeader(req)('accept'))
      })

      await makeFetch(app)('/').expect('*/*')
    })
    it('should handle referrer "r"s', async () => {
      const app = runServer((req, res) => {
        res.end(getRequestHeader(req)('referrer'))
      })

      await makeFetch(app)('/', {
        headers: {
          'Referrer-Policy': 'unsafe-url',
          referer: 'localhost:3000',
        },
      }).expect('localhost:3000')
    })
  })
  describe('req.xhr', () => {
    it('should be false in node environment', async () => {
      const app = runServer((req, res) => {
        res.end(`Browser request: ${checkIfXMLHttpRequest(req) ? 'yes' : 'no'}`)
      })

      await makeFetch(app)('/').expect('Browser request: no')
    })
  })
  describe('req.accepts()', () => {
    it('should detect an "Accept" header', async () => {
      const app = runServer((req, res) => {
        const accepts = getAccepts(req)()

        res.end(accepts[0])
      })

      await makeFetch(app)('/', {
        headers: {
          Accept: 'text/plain',
        },
      }).expect('text/plain')
    })
    it('should detect multiple values in "Accept"', async () => {
      const app = runServer((req, res) => {
        const accepts = getAccepts(req)()

        res.end((accepts as string[]).join(' | '))
      })

      await makeFetch(app)('/', {
        headers: {
          Accept: 'text/plain, text/html',
        },
      }).expect('text/plain | text/html')
    })
  })
  describe('req.fresh', () => {
    it('returns false if method is neither GET nor HEAD', async () => {
      const app = runServer((req, res) => {
        const fresh = getFreshOrStale(req, res)

        res.end(fresh ? 'fresh' : 'rotten')
      })

      await makeFetch(app)('/', {
        method: 'POST',
        body: 'Hello World',
      }).expect('rotten')
    })
  })
  it('returns false if status code is neither >=200 nor < 300, nor 304', async () => {
    const app = runServer((req, res) => {
      res.statusCode = 418

      const fresh = getFreshOrStale(req, res)

      res.end(fresh ? 'fresh' : 'rotten')
    })

    await makeFetch(app)('/').expect('rotten')
  })

  describe('req.range', () => {
    it('should return parsed ranges', async () => {
      const app = runServer((req, res) => {
        const range = getRangeFromHeader(req)
        const array = range(300)
        expect(array).toContainEqual({ end: 299, start: 0 })
        expect(array).toHaveLength(1)
        res.end()
      })

      await makeFetch(app)('/', {
        headers: {
          Range: 'bytes=0-1000',
        },
      })
      expect.assertions(2)
    })
    it('should cap to the given size', async () => {
      const app = runServer((req, res) => {
        const range = getRangeFromHeader(req)
        const size = 300
        expect(range(size)[0].end).toBe(size - 1)
        res.end()
      })

      await makeFetch(app)('/', {
        headers: {
          Range: 'bytes=0-1000',
        },
      })
      expect.assertions(1)
    })
    it('should cap to the given size when open-ended', async () => {
      const app = runServer((req, res) => {
        const range = getRangeFromHeader(req)
        const size = 300
        expect(range(size)[0].end).toBe(size - 1)
        res.end()
      })

      await makeFetch(app)('/', {
        headers: {
          Range: 'bytes=0-',
        },
      })
      expect.assertions(1)
    })
    it('should have a .type', async () => {
      const app = runServer((req, res) => {
        const range = getRangeFromHeader(req)
        expect((range(300) as Ranges).type).toBe('bytes')
        res.end()
      })

      await makeFetch(app)('/', {
        headers: {
          Range: 'bytes=0-1000',
        },
      })
      expect.assertions(1)
    })
    it('should accept any type', async () => {
      const app = runServer((req, res) => {
        const range = getRangeFromHeader(req)
        expect((range(300) as Ranges).type).toBe('any')
        res.end()
      })

      await makeFetch(app)('/', {
        headers: {
          Range: 'any=0-1000',
        },
      })
      expect.assertions(1)
    })
    it('should return undefined if no range', async () => {
      const app = runServer((req, res) => {
        const range = getRangeFromHeader(req)
        expect(range(300)).toBeUndefined()
        res.end()
      })

      await makeFetch(app)('/')
      expect.assertions(1)
    })
    describe('with options', () => {
      it('should return combined ranges if combine set to true', async () => {
        const app = runServer((req, res) => {
          const range = getRangeFromHeader(req)
          const array = range(300, { combine: true })
          expect(array).toContainEqual({ end: 299, start: 0 })
          expect(array).toHaveLength(1)
          res.end()
        })

        await makeFetch(app)('/', {
          headers: {
            Range: 'bytes=0-100, 101-500',
          },
        })
        expect.assertions(2)
      })
      it('should return separated ranges if combine set to false', async () => {
        const app = runServer((req, res) => {
          const range = getRangeFromHeader(req)
          const array = range(300, { combine: false })
          expect(array).toContainEqual({ end: 100, start: 0 })
          expect(array).toContainEqual({ end: 299, start: 101 })
          expect(array).toHaveLength(2)
          res.end()
        })

        await makeFetch(app)('/', {
          headers: {
            Range: 'bytes=0-100, 101-500',
          },
        })
        expect.assertions(3)
      })
    })
  })
  describe('req.is', () => {
    it('should return the given MIME type when matching', async () => {
      const app = runServer((req, res) => {
        expect(reqIs(req)('text/plain')).toBe('text/plain')
        res.end()
      })
      await makeFetch(app)('/', {
        headers: {
          'Content-Type': 'text/plain',
        },
      })
      expect.assertions(1)
    })
    it('should return false when not matching', async () => {
      const app = runServer((req, res) => {
        expect(reqIs(req)('text/other')).toBe(false)
        res.end()
      })
      await makeFetch(app)('/', {
        headers: {
          'Content-Type': 'text/plain',
        },
      })
      expect.assertions(1)
    })
    it('should return false when Content-Type header is not present', async () => {
      const app = runServer((req, res) => {
        expect(reqIs(req)('text/other')).toBe(false)
        res.end()
      })
      await makeFetch(app)('/', {
        headers: {},
      })
      expect.assertions(1)
    })
    it("Should lookup the MIME type with the extension given (e.g. req.is('json')", async () => {
      const app = runServer((req, res) => {
        expect(reqIs(req)('json')).toBe('json')
        res.end()
      })
      await makeFetch(app)('/', {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      expect.assertions(1)
    })
    it('should ignore charset', async () => {
      const app = runServer((req, res) => {
        expect(reqIs(req)('text/html')).toBe('text/html')
        res.end()
      })
      await makeFetch(app)('/', {
        headers: {
          'Content-Type': 'text/html; charset=UTF-8',
        },
      })

      expect.assertions(1)
    })
  })
})
