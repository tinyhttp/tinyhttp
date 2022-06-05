import { describe, expect, it } from 'vitest'
import { getQueryParams, getURLParams, getPathname } from '../../packages/url/src'
import { parse as rg } from 'regexparam'

describe('getQueryParams(url)', () => {
  it('parses query params the same way as url.parse(str, true)', () => {
    const str = '/hello?world=42'

    expect(getQueryParams(str)).toEqual({ world: '42' })
  })
  it('parses the url and return empty object if no query params found', () => {
    const str = '/hello'

    expect(getQueryParams(str)).toEqual({})
  })
})

describe('getURLParams(reqUrl, url)', () => {
  it('returns empty object if none matched', () => {
    const reqUrl = '/'

    const regex = rg('/:a/:b')

    expect(getURLParams(regex, reqUrl)).toStrictEqual({})
  })
  it('omits optional param when not supplied', () => {
    const reqUrl = '/foo/qaz'

    const regex = rg('/foo/:bar/:baz?')

    expect(getURLParams(regex, reqUrl)).toStrictEqual({ bar: 'qaz' })
  })
  it('parses URL params and returns an object with matches', () => {
    const reqUrl = '/hello/world'

    const regex = rg('/:a/:b')

    expect(getURLParams(regex, reqUrl)).toStrictEqual({
      a: 'hello',
      b: 'world'
    })
  })
  it('URL params are URI encoded', () => {
    const reqUrl = '/Foo%20Bar'

    const regex = rg('/:url')

    expect(getURLParams(regex, reqUrl)).toStrictEqual({
      url: 'Foo Bar'
    })
  })
})
describe('getPathname(url)', () => {
  it('returns pathname of a path', () => {
    expect(getPathname('/abc/def')).toBe('/abc/def')
    expect(getPathname('/abc')).toBe('/abc')
  })
  it('does not include query params', () => {
    expect(getPathname('/abc?def=hgi')).toBe('/abc')
  })
})
