import { InitAppAndTest } from '../../test_helpers/initAppAndTest'
import { ping } from '../../packages/ping/src'

describe('tinyhttp ping time', () => {
  it('puts ping time in header', async () => {
    const { fetch } = InitAppAndTest(ping())

    await fetch('/')
      .expect('x-response-time', /^[0-9]{1,3}ms$/)
      .expect(404)
  })
  it('does not round time', async () => {
    const { fetch } = InitAppAndTest(
      ping({
        round: true,
      })
    )

    await fetch('/')
      .expect('x-response-time', /^[0-9]{1,3}.[0-9]{3,6}ms$/)
      .expect(404)
  })
})
