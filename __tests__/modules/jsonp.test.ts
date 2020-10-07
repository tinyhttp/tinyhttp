import { jsonp } from '../../packages/jsonp/src/index'
import { InitAppAndTest } from '../../test_helpers/initAppAndTest'

describe('jsonp', function () {
  it('when no callback is defined', async () => {
    const { fetch } = InitAppAndTest((req, res) => jsonp(req, res)({ jsonp: 'value' }))
    await fetch('/').expect('Content-Type', 'application/json; charset=utf-8').expect(200, '{"jsonp":"value"}')
  })

  it('should use callback with jsonp when defined', async () => {
    const { fetch } = InitAppAndTest((req, res) => jsonp(req, res)({ jsonp: 'value' }))

    await fetch('/?callback=something')
      .expect('Content-Type', 'text/javascript; charset=utf-8')
      .expect(200, '/**/ typeof something === \'function\' && something({"jsonp":"value"});')
  })

  it('should change <>& into UTF', async () => {
    const { fetch } = InitAppAndTest((req, res) => jsonp(req, res)({ jsonp: '<value>& value' }, { escape: true, spaces: 1 }))

    await fetch('/?callback=something')
      .expect('Content-Type', 'text/javascript; charset=utf-8')
      .expect(200, "/**/ typeof something === 'function' && something({" + '\n' + ' "jsonp": "\\u003cvalue\\u003e\\u0026 value"' + '\n' + '});')
  })
})
