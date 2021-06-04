import { describe, expect, it } from '@jest/globals'
import { getQueryParams, getURLParams, getPathname } from '../../packages/url/src'
import { parse as rg } from 'regexparam'

describe('getQueryParams(url)', () => {
  it('parses query params the same way as url.parse(str, true)', () => {
    const str = '/hello?world=42'

    expect(getQueryParams(str)).toEqual({ world: '42' })
  })
})

describe('getURLParams(reqUrl, url)', () => {
  it('returns empty object if none matched', () => {
    const reqUrl = '/'

    const regex = rg('/:a/:b')

    expect(getURLParams(regex, reqUrl)).toStrictEqual({})
  })
  it('parses URL params and returns an object with matches', () => {
    const reqUrl = '/hello/world'

    const regex = rg('/:a/:b')

    expect(getURLParams(regex, reqUrl)).toStrictEqual({
      a: 'hello',
      b: 'world'
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
