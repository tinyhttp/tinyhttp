import { markdownStaticHandler } from '../../packages/markdown/src'
import { InitAppAndTest } from '../../test_helpers/initAppAndTest'
import path from 'path'
import { makeFetch } from 'supertest-fetch'

const STATIC_FOLDER = path.join(__dirname, '../fixtures')

describe('Routing', () => {
  it('should send the file matched', async () => {
    const { fetch } = InitAppAndTest(
      markdownStaticHandler(STATIC_FOLDER, {
        markedOptions: {
          headerIds: false,
        },
      })
    )

    const res = await fetch('/page')

    expect((await res.text()).trim()).toContain(`<h1>Hello World</h1>`)

    expect(res.status).toBe(200)
  })
  it('should send 404 if no such file is found', async () => {
    const { fetch } = InitAppAndTest(
      markdownStaticHandler(STATIC_FOLDER, {
        markedOptions: {
          headerIds: false,
        },
      })
    )

    await fetch('/non-existent-page').expect(404)
  })
})

describe('Handler options', () => {
  describe('recursive', () => {
    it('should detect folders', async () => {
      const { fetch } = InitAppAndTest(
        markdownStaticHandler(STATIC_FOLDER, {
          recursive: true,
        })
      )

      await fetch('/folder/page2').expect(200)
    })
    it(`should work with deeply nested folders`, async () => {
      const { fetch } = InitAppAndTest(
        markdownStaticHandler(STATIC_FOLDER, {
          recursive: true,
        })
      )

      await fetch('/folder/more/3').expect(200)
    })
  })
})
