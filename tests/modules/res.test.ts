import { describe, expect, it } from 'vitest'
import { makeFetch } from 'supertest-fetch'
import path from 'path'
import type { Request, Response } from '../../packages/app/src/index.js'
import {
  formatResponse,
  getResponseHeader,
  redirect,
  setHeader,
  setVaryHeader,
  setContentType,
  attachment,
  download,
  setCookie,
  clearCookie,
  append,
  setLinksHeader,
  setLocationHeader
} from '../../packages/res/src/index.js'
import { runServer } from '../../test_helpers/runServer'
import { dirname } from 'dirname-filename-esm'

const __dirname = dirname(import.meta)

describe('Response extensions', () => {
  describe('res.set(field, val)', () => {
    it('should set a string header with a string value', async () => {
      const app = runServer((_, res) => {
        setHeader(res)('hello', 'World')
        res.end()
      })

      await makeFetch(app)('/').expectHeader('hello', 'World')
    })
    it('should set an array of header values', async () => {
      const app = runServer((_, res) => {
        setHeader(res)('foo', ['bar', 'baz'])
        res.end()
      })

      await makeFetch(app)('/').expectHeader('foo', 'bar, baz')
    })
    it('should throw if `Content-Type` header is passed as an array', async () => {
      const app = runServer((_, res) => {
        try {
          setHeader(res)('content-type', ['foo', 'bar'])
        } catch (e) {
          res.statusCode = 500
          res.end((e as TypeError).message)
        }
      })
      await makeFetch(app)('/').expect(500, 'Content-Type cannot be set to an Array')
    })
    it('if the first argument is object, then map keys to values', async () => {
      const app = runServer((_, res) => {
        setHeader(res)({ foo: 'bar' })
        res.end()
      })

      await makeFetch(app)('/').expectHeader('foo', 'bar')
    })
    it('should not set a charset of one is already set', async () => {
      const app = runServer((_, res) => {
        setHeader(res)('content-type', 'text/plain; charset=UTF-8')
        res.end()
      })

      await makeFetch(app)('/').expectHeader('content-type', 'text/plain; charset=UTF-8')
    })
  })
  describe('res.get(field)', () => {
    it('should get a header with a specified field', async () => {
      const app = runServer((_, res) => {
        setHeader(res)('hello', 'World')
        res.end(getResponseHeader(res)('hello'))
      })

      await makeFetch(app)('/').expect('World')
    })
  })
  describe('res.vary(field)', () => {
    it('should set a "Vary" header properly', async () => {
      const app = runServer((_, res) => {
        setVaryHeader(res)('User-Agent').end()
      })

      await makeFetch(app)('/').expect('Vary', 'User-Agent')
    })
  })
  describe('res.redirect(url, status)', () => {
    it('should set 302 status and message about redirecting', async () => {
      const app = runServer((req, res) => {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        redirect(req, res, () => {})('/abc').end()
      })

      await makeFetch(app)('/', {
        redirect: 'manual'
      }).expect(302, 'Found. Redirecting to /abc')
    })
    it('should follow the redirect', async () => {
      const app = runServer((req, res) => {
        if (req.url === '/abc') {
          res.writeHead(200).end('Hello World')
        } else {
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          redirect(req, res, () => {})('/abc').end()
        }
      })

      await makeFetch(app)('/', {
        redirect: 'follow'
      }).expect(200, 'Hello World')
    })
    it('should send an HTML link to redirect to', async () => {
      const app = runServer((req, res) => {
        if (req.url === '/abc') {
          res.writeHead(200).end('Hello World')
        } else {
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          redirect(req, res, () => {})('/abc').end()
        }
      })

      await makeFetch(app)('/', {
        redirect: 'manual',
        headers: {
          Accept: 'text/html'
        }
      }).expect(302, '<p>Found. Redirecting to <a href="/abc">/abc</a></p>')
    })
    it('should send an empty response for unsupported MIME types', async () => {
      const app = runServer((req, res) => {
        redirect(req, res, (err) => res.writeHead(err.status).end(err.message))('/abc').end()
      })

      await makeFetch(app)('/', {
        redirect: 'manual',
        headers: {
          Accept: 'image/jpeg,image/webp'
        }
      }).expect(302, '')
    })
  })
  describe('res.format(obj)', () => {
    it('should send text by default', async () => {
      const app = runServer((req, res) => {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        formatResponse(req, res, () => {})({
          text: (_: Request, res: Response) => res.end(`Hello World`)
        }).end()
      })

      await makeFetch(app)('/').expect(200, 'Hello World')
    })
    it('should send HTML if specified in "Accepts" header', async () => {
      const app = runServer((req, res) => {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        formatResponse(req, res, () => {})({
          text: (_: Request, res: Response) => res.end(`Hello World`),
          html: (_: Request, res: Response) => res.end('<h1>Hello World</h1>')
        }).end()
      })

      await makeFetch(app)('/', {
        headers: {
          Accept: 'text/html'
        }
      })
        .expect(200, '<h1>Hello World</h1>')
        .expectHeader('Content-Type', 'text/html')
    })
    it('should throw 406 status when invalid MIME is specified', async () => {
      const app = runServer((req, res) => {
        formatResponse(req, res, (err) => res.writeHead(err.status).end(err.message))({
          text: (_: Request, res: Response) => res.end(`Hello World`)
        }).end()
      })

      await makeFetch(app)('/', {
        headers: {
          Accept: 'foo/bar'
        }
      }).expect(406, 'Not Acceptable')
    })
    it('should call `default` as a function if specified', async () => {
      const app = runServer((req, res) => {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        formatResponse(req, res, () => {})({
          default: () => res.end('Hello World')
        }).end()
      })

      await makeFetch(app)('/').expect(200, 'Hello World')
    })
  })
  describe('res.type(type)', () => {
    it('should detect MIME type', async () => {
      const app = runServer((_, res) => {
        setContentType(res)('html').end()
      })

      await makeFetch(app)('/').expect('Content-Type', 'text/html; charset=utf-8')
    })
    it('should detect MIME type by extension', async () => {
      const app = runServer((_, res) => {
        setContentType(res)('.html').end()
      })

      await makeFetch(app)('/').expect('Content-Type', 'text/html; charset=utf-8')
    })
  })
  describe('res.attachment(filename)', () => {
    it('should set Content-Disposition without a filename specified', async () => {
      const app = runServer((_, res) => {
        attachment(res)().end()
      })

      await makeFetch(app)('/').expect('Content-Disposition', 'attachment')
    })
    it('should set Content-Disposition with a filename specified', async () => {
      const app = runServer((_, res) => {
        attachment(res)(path.join(__dirname, '../fixtures', 'favicon.ico')).end()
      })

      await makeFetch(app)('/').expect('Content-Disposition', 'attachment; filename="favicon.ico"')
    })
  })
  describe('res.download(filename)', () => {
    it('should set Content-Disposition based on path', async () => {
      const app = runServer((req, res) => {
        download(req, res)(path.join(__dirname, '../fixtures', 'favicon.ico')).end()
      })

      await makeFetch(app)('/').expect('Content-Disposition', 'attachment; filename="favicon.ico"')
    })
    it('should set Content-Disposition based on filename', async () => {
      const app = runServer((req, res) => {
        download(req, res)(path.join(__dirname, '../fixtures', 'favicon.ico'), 'favicon.icon').end()
      })

      await makeFetch(app)('/').expect('Content-Disposition', 'attachment; filename="favicon.icon"')
    })
    it('should pass the error to a callback', async () => {
      const app = runServer((req, res) => {
        download(req, res)(path.join(__dirname, '../fixtures'), 'some_file.png', (err) => {
          expect((err as Error).message).toContain('EISDIR')
        }).end()
      })

      await makeFetch(app)('/').expect('Content-Disposition', 'attachment; filename="some_file.png"')
    })
    it('should set "root" from options', async () => {
      const app = runServer((req, res) => {
        download(req, res)('favicon.ico', () => void 0, {
          root: path.join(__dirname, '../fixtures')
        }).end()
      })

      await makeFetch(app)('/').expect('Content-Disposition', 'attachment; filename="favicon.ico"')
    })
    it(`'should pass options to sendFile's ReadStream'`, async () => {
      const app = runServer((req, res) => {
        download(req, res)(path.join(__dirname, '../fixtures', 'favicon.ico'), () => void 0, {
          encoding: 'ascii'
        }).end()
      })

      await makeFetch(app)('/').expect('Content-Disposition', 'attachment; filename="favicon.ico"')
    })
    it('should set headers from options', async () => {
      const app = runServer((req, res) => {
        download(req, res)(path.join(__dirname, '../fixtures', 'favicon.ico'), () => void 0, {
          headers: {
            'X-Custom-Header': 'Value'
          }
        }).end()
      })

      await makeFetch(app)('/')
        .expect('Content-Disposition', 'attachment; filename="favicon.ico"')
        .expect('X-Custom-Header', 'Value')
    })
  })
  describe('res.cookie(name, value, options)', () => {
    it('serializes the cookie and puts it in a Set-Cookie header', async () => {
      const app = runServer((req, res) => {
        setCookie(req, res)('hello', 'world').end()

        expect(res.getHeader('Set-Cookie')).toBe('hello=world; Path=/')
      })

      await makeFetch(app)('/').expect(200)
    })
    it('sets default path to "/" if not specified in options', async () => {
      const app = runServer((req, res) => {
        setCookie(req, res)('hello', 'world').end()

        expect(res.getHeader('Set-Cookie')).toContain('Path=/')
      })

      await makeFetch(app)('/').expect(200)
    })
    it('should throw if it is signed and and no secret is provided', async () => {
      const app = runServer((req, res) => {
        try {
          setCookie(req, res)('hello', 'world', {
            signed: true
          }).end()
        } catch (e) {
          res.end((e as TypeError).message)
        }
      })

      await makeFetch(app)('/').expect('cookieParser("secret") required for signed cookies')
    })
    it('should set "maxAge" and "expires" from options', async () => {
      const maxAge = 3600 * 24 * 365

      const app = runServer((req, res) => {
        setCookie(req, res)('hello', 'world', {
          maxAge
        }).end()

        expect(res.getHeader('Set-Cookie')).toContain(`Max-Age=${maxAge / 1000}; Path=/; Expires=`)
      })

      await makeFetch(app)('/').expect(200)
    })
    it('should append to Set-Cookie if called multiple times', async () => {
      const app = runServer((req, res) => {
        setCookie(req, res)('hello', 'world')
        setCookie(req, res)('foo', 'bar').end()
      })

      await makeFetch(app)('/').expect(200).expectHeader('Set-Cookie', 'hello=world; Path=/, foo=bar; Path=/')
    })
  })
  describe('res.clearCookie(name, options)', () => {
    it('sets path to "/" if not specified in options', async () => {
      const app = runServer((req, res) => {
        clearCookie(req, res)('cookie').end()

        expect(res.getHeader('Set-Cookie')).toContain('Path=/;')
      })

      await makeFetch(app)('/').expect(200)
    })
  })
  describe('res.append(field,value)', () => {
    it('sets new header if header not present', async () => {
      const app = runServer((_, res) => {
        append(res)('hello', 'World')
        res.end()
      })

      await makeFetch(app)('/').expectHeader('hello', 'World')
    })
    it('appends value to existing header value', async () => {
      const app = runServer((_, res) => {
        setHeader(res)('hello', 'World1')
        append(res)('hello', 'World2')
        res.end()
      })

      await makeFetch(app)('/').expectHeader('hello', ['World1', 'World2'])
    })
    it('appends value to existing header array', async () => {
      const app = runServer((_, res) => {
        setHeader(res)('hello', ['World1', 'World2'])
        append(res)('hello', 'World3')
        res.end()
      })

      await makeFetch(app)('/').expectHeader('hello', ['World1', 'World2', 'World3'])
    })
    it('appends value array to existing header value', async () => {
      const app = runServer((_, res) => {
        setHeader(res)('hello', 'World1')
        append(res)('hello', ['World2', 'World3'])
        res.end()
      })

      await makeFetch(app)('/').expectHeader('hello', ['World1', 'World2', 'World3'])
    })
  })
  describe('res.links(obj)', () => {
    it('should set "Links" header field', async () => {
      const app = runServer((_, res) => {
        setLinksHeader(res)({
          next: 'http://api.example.com/users?page=2',
          last: 'http://api.example.com/users?page=5'
        }).end()
      })

      await makeFetch(app)('/')
        .expectHeader(
          'Link',
          '<http://api.example.com/users?page=2>; rel="next", <http://api.example.com/users?page=5>; rel="last"'
        )
        .expectStatus(200)
    })
    it('should set "Links" for multiple calls', async () => {
      const app = runServer((_, res) => {
        setLinksHeader(res)({
          next: 'http://api.example.com/users?page=2',
          last: 'http://api.example.com/users?page=5'
        })

        setLinksHeader(res)({
          prev: 'http://api.example.com/users?page=1'
        })

        res.end()
      })

      await makeFetch(app)('/')
        .expectHeader(
          'Link',
          '<http://api.example.com/users?page=2>; rel="next", <http://api.example.com/users?page=5>; rel="last", <http://api.example.com/users?page=1>; rel="prev"'
        )
        .expectStatus(200)
    })
  })

  describe('res.location(url)', () => {
    it('sets the "Location" header', async () => {
      const app = runServer((req, res) => {
        setLocationHeader(req, res)('https://example.com').end()
      })

      await makeFetch(app)('/').expectHeader('Location', 'https://example.com').expectStatus(200)
    })
    it('should encode URL', async () => {
      const app = runServer((req, res) => {
        setLocationHeader(req, res)('https://google.com?q=\u2603 §10').end()
      })

      await makeFetch(app)('/').expectHeader('Location', 'https://google.com?q=%E2%98%83%20%C2%A710').expectStatus(200)
    })
    it('should not touch encoded sequences', async () => {
      const app = runServer((req, res) => {
        setLocationHeader(req, res)('https://google.com?q=%A710').end()
      })

      await makeFetch(app)('/').expectHeader('Location', 'https://google.com?q=%A710').expectStatus(200)
    })
    describe('"url" is back', () => {
      it('should set location from "Referer" header', async () => {
        const app = runServer((req, res) => {
          setLocationHeader(req, res)('back').end()
        })

        await makeFetch(app)('/', {
          headers: {
            Referer: '/some/page.html'
          }
        })
          .expect('Location', '/some/page.html')
          .expectStatus(200)
      })
      it('should set location from "Referrer" header', async () => {
        const app = runServer((req, res) => {
          setLocationHeader(req, res)('back').end()
        })

        await makeFetch(app)('/', {
          headers: {
            Referrer: '/some/page.html'
          }
        })
          .expect('Location', '/some/page.html')
          .expectStatus(200)
      })
      it('should prefer "Referrer" header', async () => {
        const app = runServer((req, res) => {
          setLocationHeader(req, res)('back').end()
        })

        await makeFetch(app)('/', {
          headers: {
            Referer: '/some/page1.html',
            Referrer: '/some/page2.html'
          }
        })
          .expect('Location', '/some/page2.html')
          .expectStatus(200)
      })
      it('should set the header to "/" without referrer', async () => {
        const app = runServer((req, res) => {
          setLocationHeader(req, res)('back').end()
        })

        await makeFetch(app)('/').expect('Location', '/').expectStatus(200)
      })
    })
  })
})
