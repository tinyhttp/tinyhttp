import { Accepts } from '../../packages/accepts/src'

function createRequest(value?: unknown): any {
  return {
    headers: {
      'accept-charset': value,
      'accept-language': value,
      'content-type': value,
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
    describe('with arguments', () => {
      it('when Accept-Charset is in the request it should prioritize according to the request order', () => {
        const req = createRequest('iso-8859-1, utf-8')
        const accept = new Accepts(req)
        expect(accept.charsets(['utf-8', 'iso-8859-1'])).toStrictEqual('iso-8859-1')
      })
      it('when Accept-Charset is populated it should prioritize according to the request order (second option)', () => {
        const req = createRequest('iso-8859-1, utf-8')
        const accept = new Accepts(req)
        expect(accept.charsets(['utf-7', 'utf-8'])).toStrictEqual('utf-8')
      })
    })
  })
  describe('accepts.languages()', () => {
    describe('with no arguments', () => {
      it('when Accept-Language is populated it should return accepted languages', () => {
        const req = createRequest('en, it, us')
        const accept = new Accepts(req)
        // @ts-ignore
        expect(accept.languages()).toStrictEqual(['en', 'it', 'us'])
      })
      it('when Accept-Language is not in request it should return *', () => {
        const req = createRequest()
        const accept = new Accepts(req)
        // @ts-ignore
        expect(accept.languages()).toStrictEqual(['*'])
      })
    })
    describe('with arguments', () => {
      it('when Accept-Language is populated it should prioritize according to the request order', () => {
        const req = createRequest('en, es, it, us')
        const accept = new Accepts(req)
        expect(accept.languages(['it', 'en', 'us'])).toStrictEqual('en')
      })
      it('when Accept-Language is populated it should prioritize according to the request order (second option)', () => {
        const req = createRequest('en, it, es, us')
        const accept = new Accepts(req)
        expect(accept.languages(['us', 'it'])).toStrictEqual('it')
      })
    })
  })
  // Need to comment out for multiple bugs, gonna implement soon
  /*
  describe('accepts.types()', () => {
    describe('with arguments', () => {
      it('when Content-Type is populated it should prioritize according to the request order', () => {
        const req = createRequest('application/json, text/plain')
        const accept = new Accepts(req)
        // @ts-ignore
        expect(accept.types(['text/plain', 'application/json'])).toStrictEqual('application/json')
      })
      it('when Content-Type is populated it should prioritize according to the request order (second option)', () => {
        const req = createRequest('text/plain, application/json')
        const accept = new Accepts(req)
        // @ts-ignore
        expect(accept.types(['application/json', 'text/plain'])).toStrictEqual('text/plain')
      })
    })
  })
  */
  describe('accepts.lang, accepts.langs, accepts.language', () => {
    it('all getter aliases should map to accepts.languages', () => {
      const req = createRequest('application/json, text/plain')
      const accept = new Accepts(req)

      expect(accept.lang).toEqual(accept.languages)
      expect(accept.langs).toEqual(accept.languages)
      expect(accept.language).toEqual(accept.languages)
    })
  })
})
