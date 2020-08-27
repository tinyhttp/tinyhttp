import { InitAppAndTest } from './app.test'

describe('Request properties', () => {
  it('should have default HTTP Request properties', (done) => {
    const { request } = InitAppAndTest((req, res) => {
      res.status(200).json({
        url: req.url,
        complete: req.complete,
      })
    })

    request.get('/').expect(200, { url: '/', complete: false }, done)
  })
  it('req.query is being parsed properly', (done) => {
    const { request } = InitAppAndTest((req, res) => void res.send(req.query))

    request.get('/?param1=val1&param2=val2').expect(
      200,
      {
        param1: 'val1',
        param2: 'val2',
      },
      done
    )
  })
  it('req.params is being parsed properly', (done) => {
    const { request } = InitAppAndTest((req, res) => void res.send(req.params), '/:param1/:param2')

    request.get('/val1/val2').expect(
      200,
      {
        param1: 'val1',
        param2: 'val2',
      },
      done
    )
  })
  it('req.xhr is false because of node-superagent', (done) => {
    const { request } = InitAppAndTest((req, res) => {
      res.send(`XMLHttpRequest: ${req.xhr ? 'yes' : 'no'}`)
    })

    request.get('/').expect(200, `XMLHttpRequest: no`, done)
  })
  it('req.protocol is http by default', (done) => {
    const { request } = InitAppAndTest(
      (req, res) => {
        res.send(`protocol: ${req.protocol}`)
      },
      '/',
      'GET',
      {
        settings: {
          networkExtensions: true,
        },
      }
    )

    request.get('/').expect(200, `protocol: http`, done)
  })
})

describe('Request methods', () => {
  it('req.set sets the header and req.get returns a header', (done) => {
    const { request } = InitAppAndTest((req, res) => {
      req.set('X-Header', '123')
      res.end(req.get('X-Header'))
    })

    request.get('/').expect(200, `123`, done)
  })
})
