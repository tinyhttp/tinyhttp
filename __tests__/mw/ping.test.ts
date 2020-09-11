import { InitAppAndTest } from '../app.test'
import { ping } from '../../packages/ping/src'

describe('tinyhttp ping time', () => {
  it('puts ping time in header', () => {
    const { request } = InitAppAndTest(ping())

    return request
      .get('/')
      .expect('x-response-time', /^[0-9]{1,3}ms$/)
      .expect(404)
  })
  it('does not round time', () => {
    const { request } = InitAppAndTest(
      ping({
        round: true,
      })
    )

    return request
      .get('/')
      .expect('x-response-time', /^[0-9]{1,3}.[0-9]{3,6}ms$/)
      .expect(404)
  })
})
