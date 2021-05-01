import { describe, expect, it } from '@jest/globals'
import { forwarded } from '../../packages/forwarded/src'
import { createReq } from '../../test_helpers/createReq'
import { IncomingMessage } from 'http'

describe('forwarded(req)', () => {
  it('should work with `X-Forwarded-For` header', () => {
    const req = createReq('127.0.0.1') as IncomingMessage

    expect(forwarded(req)).toEqual(['127.0.0.1'])
  })
  it('should include entries from `X-Forwarded-For`', () => {
    const req = createReq('127.0.0.1', {
      'x-forwarded-for': '10.0.0.2, 10.0.0.1'
    }) as IncomingMessage

    expect(forwarded(req)).toEqual(['127.0.0.1', '10.0.0.1', '10.0.0.2'])
  })
  it('should skip blank entries', () => {
    const req = createReq('127.0.0.1', {
      'x-forwarded-for': '10.0.0.2,, 10.0.0.1'
    }) as IncomingMessage

    expect(forwarded(req)).toEqual(['127.0.0.1', '10.0.0.1', '10.0.0.2'])
  })
  it('should trim leading OWS', () => {
    const req = createReq('127.0.0.1', {
      'x-forwarded-for': ' 10.0.0.2 ,  , 10.0.0.1 '
    }) as IncomingMessage

    expect(forwarded(req)).toEqual(['127.0.0.1', '10.0.0.1', '10.0.0.2'])
  })
})
