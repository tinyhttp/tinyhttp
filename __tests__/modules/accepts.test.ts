import { Accepts } from '../../packages/accepts/src'

function createRequest(charset?: unknown): any {
  return {
    headers: {
      'accept-charset': charset,
    },
  }
}

describe('new Accepts(req)', () => {
  describe('accepts.charsets()', () => {
    describe('with no arguments', () => {
      it('when Accept-Charset is populated it should return accepted types', () => {
        const req = createRequest('utf-8, iso-8859-1;q=0.2, utf-7;q=0.5')
        const accept = new Accepts(req)
        expect(accept.charsets()).toStrictEqual(['utf-8', 'utf-7', 'iso-8859-1'])
      })
      it('when Accept-Charset is not in request should return *', () => {
        const req = createRequest()
        const accept = new Accepts(req)
        expect(accept.charsets()).toStrictEqual(['*'])
      })
    })
  })
})
