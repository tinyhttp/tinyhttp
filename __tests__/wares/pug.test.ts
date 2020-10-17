import { pug } from '../../packages/pug/src'
import { InitAppAndTest } from '../../test_helpers/initAppAndTest'

describe('Pug templates tests', () => {
  it('should render pug template', async () => {
    const { fetch, app } = InitAppAndTest((_req, res) => void res.render('../__tests__/fixtures/views/test.pug', null, { renderOptions: { pageTitle: 'Test title', foo: 'bar' } }))
    pug()(app)

    await fetch('/').expect(200, '<!DOCTYPE html><html lang="en"><head><title>Test title</title></head><body><h1>Pug bar</h1></body></html>')
  })
})
