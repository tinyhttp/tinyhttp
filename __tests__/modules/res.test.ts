import { makeFetch } from 'supertest-fetch'
import path from 'path'
import { Request, Response } from '../../packages/app/src'
import { formatResponse, getResponseHeader, redirect, setHeader, setVaryHeader, setContentType, attachment, download, setCookie, clearCookie } from '../../packages/res/src'
import { runServer } from '../../test_helpers/runServer'

describe('Response extensions', () => {
  describe('res.set(field, val)', () => {
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
  describe('res.get(field)', () => {
    it('should get a header with a specified field', async () => {
      const app = runServer((req, res) => {
        setHeader(req, res)('hello', 'World')
        res.end(getResponseHeader(req, res)('hello'))
      })

      await makeFetch(app)('/').expect('World')
    })
  })
  describe('res.vary(field)', () => {
    it('should set a "Vary" header properly', async () => {
      const app = runServer((req, res) => {
        setVaryHeader(req, res)('User-Agent').end()
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
        redirect: 'manual',
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
        redirect: 'follow',
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
          Accept: 'text/html',
        },
      }).expect(302, '<p>Found. Redirecting to <a href="/abc">/abc</a></p>')
    })
  })
  describe('res.format(obj)', () => {
    it('should send text by default', async () => {
      const app = runServer((req, res) => {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        formatResponse(req, res, () => {})({
          text: (_: Request, res: Response) => res.end(`Hello World`),
        }).end()
      })

      await makeFetch(app)('/').expect(200, 'Hello World')
    })
    it('should send HTML if specified in "Accepts" header', async () => {
      const app = runServer((req, res) => {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        formatResponse(req, res, () => {})({
          text: (_: Request, res: Response) => res.end(`Hello World`),
          html: (_: Request, res: Response) => res.end('<h1>Hello World</h1>'),
        }).end()
      })

      await makeFetch(app)('/', {
        headers: {
          Accept: 'text/html',
        },
      })
        .expect(200, '<h1>Hello World</h1>')
        .expectHeader('Content-Type', 'text/html')
    })
  })
  describe('res.type(type)', () => {
    it('should detect MIME type', async () => {
      const app = runServer((req, res) => {
        setContentType(req, res)('html').end()
      })

      await makeFetch(app)('/').expect('Content-Type', 'text/html')
    })
    it('should detect MIME type by extension', async () => {
      const app = runServer((req, res) => {
        setContentType(req, res)('.html').end()
      })

      await makeFetch(app)('/').expect('Content-Type', 'text/html')
    })
  })
  describe('res.attachment(filename)', () => {
    it('should set Content-Disposition without a filename specified', async () => {
      const app = runServer((req, res) => {
        attachment(req, res)().end()
      })

      await makeFetch(app)('/').expect('Content-Disposition', 'attachment')
    })
    it('should set Content-Disposition with a filename specified', async () => {
      const app = runServer((req, res) => {
        attachment(req, res)(path.join(__dirname, '../fixtures', 'favicon.ico')).end()
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
            signed: true,
          }).end()
        } catch (e) {
          res.end((e as TypeError).message)
        }
      })

      await makeFetch(app)('/').expect('cookieParser("secret") required for signed cookies')
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
})
