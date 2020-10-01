import { Accepts } from '../../packages/accepts/src'

function createRequest(value?: unknown): any {
  return {
    headers: {
      'accept-charset': value,
      'accept-language': value,
      'accept-encoding': value,
      accept: value,
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
      it('when Accept-Charset is not in request it should return *', () => {
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
      it('when Accept-Charset is populated and the argument is a wrong charset it should return false', () => {
        const req = createRequest('iso-8859-1, utf-8')
        const accept = new Accepts(req)
        expect(accept.charsets('utf-7')).toStrictEqual(false)
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
      it('when Accept-Language is populated and the supplied argument is wrong it should return false', () => {
        const req = createRequest('en, it, es, us')
        const accept = new Accepts(req)
        expect(accept.languages('fr')).toStrictEqual(false)
      })
    })
  })
  describe('accepts.types()', () => {
    describe('with arguments', () => {
      it('when Accept is not populated it should return the first option', () => {
        const req = createRequest()
        const accept = new Accepts(req)
        expect(accept.types(['text/plain', 'application/json'])).toStrictEqual('text/plain')
      })
      it('when Accept is populated it should prioritize according to the request order', () => {
        const req = createRequest('application/json, text/plain')
        const accept = new Accepts(req)
        expect(accept.types(['text/plain', 'application/json'])).toStrictEqual('application/json')
      })
      it('when Accept is populated it should prioritize according to the request order (second option)', () => {
        const req = createRequest('text/plain, application/json')
        const accept = new Accepts(req)
        expect(accept.types(['application/json', 'text/plain'])).toStrictEqual('text/plain')
      })
      it('when types(...) has a string argument it should return it', () => {
        const req = createRequest()
        const accept = new Accepts(req)
        expect(accept.types('text/plain')).toStrictEqual('text/plain')
      })
      it('when Accept is populated and the supplied argument is not one of the accepted types it should return false', () => {
        const req = createRequest('text/plain')
        const accept = new Accepts(req)
        expect(accept.types('application/json')).toStrictEqual(false)
      })
      it('should ignore invalid data', () => {
        const req = createRequest('html, text/plain')
        const accept = new Accepts(req)
        // @ts-ignore
        expect(accept.types(['html'])).toStrictEqual(false)
      })
    })
    describe('without arguments', () => {
      it('when no argument is supplied it should return all accepted types', () => {
        const req = createRequest('text/plain, application/json')
        const accept = new Accepts(req)
        // @ts-ignore
        expect(accept.types()).toStrictEqual(['text/plain', 'application/json'])
      })
    })
  })
  describe('accepts.encodings()', () => {
    describe('with arguments', () => {
      it('when Accept-Encoding is not populated it should return false', () => {
        const req = createRequest()
        const accept = new Accepts(req)
        expect(accept.encoding(['gzip', 'deflate'])).toStrictEqual(false)
      })
      it('when Accept-Encoding is populated it should prioritize according to the request order', () => {
        const req = createRequest('gzip, deflate, compress')
        const accept = new Accepts(req)
        expect(accept.encoding(['deflate', 'gzip'])).toStrictEqual('gzip')
      })
      it('when Accept-Encodings is populated, it should return false when supplying an invalid encoding value', () => {
        const req = createRequest('gzip, deflate, compress')
        const accept = new Accepts(req)
        expect(accept.encoding('br')).toStrictEqual(false)
      })
    })
    describe('without arguments', () => {
      it('when Accept-Encodings is populated and no argument is supplied to encodings() it should return every accepted encoding method', () => {
        const req = createRequest('gzip, deflate')
        const accept = new Accepts(req)
        // @ts-ignore
        expect(accept.encoding()).toStrictEqual(['gzip', 'deflate', 'identity'])
      })
    })
  })
  describe('getter aliases', () => {
    it('all getter aliases for "languages" should map to accepts.languages', () => {
      const req = createRequest('application/json, text/plain')
      const accept = new Accepts(req)

      expect(accept.lang).toEqual(accept.languages)
      expect(accept.langs).toEqual(accept.languages)
      expect(accept.language).toEqual(accept.languages)
    })
    it('all getter aliases for "charset" should map to accepts.charsets', () => {
      const req = createRequest('application/json, text/plain')
      const accept = new Accepts(req)

      expect(accept.charset).toEqual(accept.charsets)
    })
    it('all getter aliases for "type" should map to accepts.types', () => {
      const req = createRequest('application/json, text/plain')
      const accept = new Accepts(req)

      expect(accept.type).toEqual(accept.types)
    })
  })
})
