import { describe, expect, it } from 'vitest'
import { InitAppAndTest } from '../../test_helpers/initAppAndTest'
import { renderFile } from 'eta'
import { App } from '../../packages/app/src/app'
import { makeFetch } from 'supertest-fetch'
import type { PartialConfig } from 'eta/dist/types/config'

describe('Response properties', () => {
  it('should have default HTTP Response properties', async () => {
    const { fetch } = InitAppAndTest((_req, res) => {
      res.status(200).json({
        statusCode: res.statusCode,
        chunkedEncoding: res.chunkedEncoding
      })
    })

    await fetch('/').expect({
      statusCode: 200,
      chunkedEncoding: false
    })
  })
})

describe('Response methods', () => {
  it('res.json stringifies the object', async () => {
    const { fetch } = InitAppAndTest((_req, res) => {
      res.json({ hello: 'world' })
    })

    await fetch('/').expect({ hello: 'world' })
  })
  it('res.send sends plain text data', async () => {
    const { fetch } = InitAppAndTest((_req, res) => {
      res.send('Hello world')
    })

    await fetch('/').expect('Hello world')
  })
  it('res.send falls back to res.json when sending objects', async () => {
    const { fetch } = InitAppAndTest((_req, res) => {
      res.send({ hello: 'world' })
    })

    await fetch('/').expect({ hello: 'world' })
  })
  it('res.status sends status', async () => {
    const { fetch } = InitAppAndTest((_req, res) => {
      res.status(418).end()
    })

    await fetch('/').expect(418)
  })
  it('res.sendStatus sends status + text', async () => {
    const { fetch } = InitAppAndTest((_req, res) => {
      res.sendStatus(418)
    })

    await fetch('/').expect(418, "I'm a Teapot")
  })
  it('res.location sends "Location" header', async () => {
    const { fetch } = InitAppAndTest((_req, res) => {
      res.location('example.com').end()
    })

    await fetch('/').expect('Location', 'example.com')
  })
  it('res.set sets headers', async () => {
    const { fetch } = InitAppAndTest((_req, res) => {
      res.set('X-Header', 'Hello World').end()
    })

    await fetch('/').expect('X-Header', 'Hello World')
  })
  it('res.send sets proper headers', async () => {
    const { fetch } = InitAppAndTest((_req, res) => {
      res.send({ hello: 'world' })
    })

    await fetch('/').expect('Content-Type', 'application/json').expect('Content-Length', '22')
  })
  it('res.links sends links', async () => {
    const { fetch } = InitAppAndTest((_req, res) => {
      res
        .links({
          next: 'http://api.example.com/users?page=2',
          last: 'http://api.example.com/users?page=5'
        })
        .end()
    })

    await fetch('/').expect(
      'Link',
      '<http://api.example.com/users?page=2>; rel="next", <http://api.example.com/users?page=5>; rel="last"'
    )
  })
  it('res.cookie sends cookies to client', async () => {
    const { fetch } = InitAppAndTest((_req, res) => {
      res.cookie('Hello', 'World').end()
    })

    await fetch('/').expect('Set-Cookie', 'Hello=World; Path=/')
  })
  describe('res.type(type)', () => {
    it('should detect MIME type', async () => {
      const { fetch } = InitAppAndTest((_req, res) => {
        res.type('html').end()
      })

      await fetch('/').expect('Content-Type', 'text/html; charset=utf-8')
    })
    it('should detect MIME type by extension', async () => {
      const { fetch } = InitAppAndTest((_req, res) => {
        res.type('.html').end()
      })

      await fetch('/').expect('Content-Type', 'text/html; charset=utf-8')
    })
  })
  describe('res.render', async () => {
    // https://github.com/expressjs/express/blob/3531987844e533742f1159b0c3f1e07fad2e4597/test/res.render.js
    it('should support absolute paths', async () => {
      const { fetch, app } = InitAppAndTest((_req, res) => {
        app.engine('eta', renderFile)
        app.locals.name = 'v1rtl'
        res.render(`${process.cwd()}/tests/fixtures/views/index.eta`)
      })

      await fetch('/').expect('Hello from v1rtl')
    })
    it('should support absolute paths with "view engine"', async () => {
      const { fetch, app } = InitAppAndTest((_req, res) => {
        app.engine('eta', renderFile)
        app.set('view engine', 'eta')
        app.locals.name = 'v1rtl'
        res.render(`${process.cwd()}/tests/fixtures/views/index`)
      })

      await fetch('/').expect('Hello from v1rtl')
    })
    it('should error without "view engine" set and file extension to a non-engine module', async () => {
      const { fetch, app } = InitAppAndTest((_req, res) => {
        app.engine('eta', renderFile)
        app.locals.name = 'v1rtl'
        res.render(`${process.cwd()}/tests/fixtures/views/not.found`)
      })

      await fetch('/').expect(500, 'No engine was found for .found')
    })
    it('should error without "view engine" set and no file extension', async () => {
      const { fetch, app } = InitAppAndTest((_req, res) => {
        app.engine('eta', renderFile)
        app.locals.name = 'v1rtl'
        res.render(`${process.cwd()}/tests/fixtures/views/index`)
      })

      await fetch('/').expect(500, 'No default engine was specified and no extension was provided.')
    })
    it('should support index files', async () => {
      const { fetch, app } = InitAppAndTest((_req, res) => {
        app.engine('eta', renderFile)
        app.set('views', `${process.cwd()}/tests/fixtures`)
        app.set('view engine', 'eta')
        app.locals.name = 'v1rtl'
        res.render(`views`)
      })

      await fetch('/').expect(200, 'Hello from v1rtl')
    })
    it('should give precedence to res.locals over app.locals', async () => {
      const app = new App()

      app.engine('eta', renderFile)
      app.set('views', `${process.cwd()}/tests/fixtures/views`)
      app.locals.name = 'v1rtl'

      app.use((_req, res) => {
        res.locals.name = 'v2rtl'
        res.render('index.eta', {})
      })

      const fetch = makeFetch(app.listen())

      await fetch('/').expect(200, 'Hello from v2rtl')
    })
    it('should give precedence to res.render() locals over res.locals', async () => {
      const app = new App()

      app.engine('eta', renderFile)
      app.set('views', `${process.cwd()}/tests/fixtures/views`)

      app.use((_req, res) => {
        res.locals.name = 'v1rtl'
        res.render('index.eta', { name: 'v2rtl' })
      })

      const fetch = makeFetch(app.listen())

      await fetch('/').expect(200, 'Hello from v2rtl')
    })
    it('should give precedence to res.render() locals over app.locals', async () => {
      const app = new App()

      app.engine('eta', renderFile)
      app.set('views', `${process.cwd()}/tests/fixtures/views`)

      app.locals.name = 'v1rtl'

      app.use((_req, res) => {
        res.render('index.eta', { name: 'v2rtl' })
      })

      const fetch = makeFetch(app.listen())

      await fetch('/').expect(200, 'Hello from v2rtl')
    })
    it('should allow passing custom engine options via res.render()', async () => {
      const app = new App()

      app.engine<PartialConfig>('eta', (name, locals, opts, cb) => {
        expect(opts.autoEscape).toEqual(false)
        return renderFile(name, locals, opts, cb)
      })
      app.set('views', `${process.cwd()}/tests/fixtures/views`)

      app.use((_req, res) => {
        res.render<PartialConfig>('index.eta', { name: 'v1rtl' }, { autoEscape: false })
      })

      const fetch = makeFetch(app.listen())

      await fetch('/').expect(200, 'Hello from v1rtl')
    })
  })
})
