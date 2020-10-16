import { pug } from '../../packages/pug/src'
import { createServer } from 'http'
import { InitAppAndTest } from '../../test_helpers/initAppAndTest'
import { renderFile } from 'pug'

describe('PUG templates tests', () => {
  it('should render pug template', async () => {
    const { fetch, app } = InitAppAndTest((_req, res) => void res.render('../__tests__/wares/pug.test.pug', null, { renderOptions: { pageTitle: 'Test title', foo: 'bar' } }))
    pug()(app)

    await fetch('/').expect(200, '<!DOCTYPE html><html lang="en"><head><title>Test title</title></head><body><h1>Pug bar</h1></body></html>')
  })
})
