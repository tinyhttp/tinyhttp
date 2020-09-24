import { makeFetch } from 'supertest-fetch'
import { checkIfXMLHttpRequest, getAccepts, getRequestHeader } from '../../packages/req/src'
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
})
