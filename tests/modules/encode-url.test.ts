import { describe, expect, it } from 'vitest'
import { encodeUrl } from '../../packages/encode-url/src'

describe('encodeUrl(url)', () => {
  it('should keep URL the same', () => {
    expect(encodeUrl('http://localhost/foo/bar.html?fizz=buzz#readme')).toBe(
      'http://localhost/foo/bar.html?fizz=buzz#readme'
    )
  })
  it('should not touch IPv6 notation', () => {
    expect(encodeUrl('http://[::1]:8080/foo/bar')).toBe('http://[::1]:8080/foo/bar')
  })
  describe('when url contains invalid raw characters', () => {
    it('should encode LF', () => {
      expect(encodeUrl('http://localhost/\nsnow.html')).toBe('http://localhost/%0Asnow.html')
    })

    it('should encode FF', () => {
      expect(encodeUrl('http://localhost/\fsnow.html')).toBe('http://localhost/%0Csnow.html')
    })

    it('should encode CR', () => {
      expect(encodeUrl('http://localhost/\rsnow.html')).toBe('http://localhost/%0Dsnow.html')
    })

    it('should encode SP', () => {
      expect(encodeUrl('http://localhost/ snow.html')).toBe('http://localhost/%20snow.html')
    })

    it('should encode NULL', () => {
      expect(encodeUrl('http://localhost/\0snow.html')).toBe('http://localhost/%00snow.html')
    })

    it('should encode all expected characters from ASCII set', () => {
      expect(encodeUrl('/\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b\x0c\x0d\x0e\x0f')).toBe(
        '/%00%01%02%03%04%05%06%07%08%09%0A%0B%0C%0D%0E%0F'
      )
      expect(encodeUrl('/\x10\x11\x12\x13\x14\x15\x16\x17\x18\x19\x1a\x1b\x1c\x1d\x1e\x1f')).toBe(
        '/%10%11%12%13%14%15%16%17%18%19%1A%1B%1C%1D%1E%1F'
      )
      expect(encodeUrl('/\x20\x21\x22\x23\x24\x25\x26\x27\x28\x29\x2a\x2b\x2c\x2d\x2e\x2f')).toBe(
        "/%20!%22#$%25&'()*+,-./"
      )
      expect(encodeUrl('/\x30\x31\x32\x33\x34\x35\x36\x37\x38\x39\x3a\x3b\x3c\x3d\x3e\x3f')).toBe(
        '/0123456789:;%3C=%3E?'
      )
      expect(encodeUrl('/\x40\x41\x42\x43\x44\x45\x46\x47\x48\x49\x4a\x4b\x4c\x4d\x4e\x4f')).toBe('/@ABCDEFGHIJKLMNO')
      expect(encodeUrl('/\x50\x51\x52\x53\x54\x55\x56\x57\x58\x59\x5a\x5b\x5c\x5d\x5e\x5f')).toBe(
        '/PQRSTUVWXYZ[%5C]%5E_'
      )
      expect(encodeUrl('/\x60\x61\x62\x63\x64\x65\x66\x67\x68\x69\x6a\x6b\x6c\x6d\x6e\x6f')).toBe('/%60abcdefghijklmno')
      expect(encodeUrl('/\x70\x71\x72\x73\x74\x75\x76\x77\x78\x79\x7a\x7b\x7c\x7d\x7e\x7f')).toBe(
        '/pqrstuvwxyz%7B%7C%7D~%7F'
      )
    })

    it('should encode all characters above ASCII as UTF-8 sequences', () => {
      expect(encodeUrl('/\x80\x81\x82\x83\x84\x85\x86\x87\x88\x89\x8a\x8b\x8c\x8d\x8e\x8f')).toBe(
        '/%C2%80%C2%81%C2%82%C2%83%C2%84%C2%85%C2%86%C2%87%C2%88%C2%89%C2%8A%C2%8B%C2%8C%C2%8D%C2%8E%C2%8F'
      )
      expect(encodeUrl('/\x90\x91\x92\x93\x94\x95\x96\x97\x98\x99\x9a\x9b\x9c\x9d\x9e\x9f')).toBe(
        '/%C2%90%C2%91%C2%92%C2%93%C2%94%C2%95%C2%96%C2%97%C2%98%C2%99%C2%9A%C2%9B%C2%9C%C2%9D%C2%9E%C2%9F'
      )
      expect(encodeUrl('/\xa0\xa1\xa2\xa3\xa4\xa5\xa6\xa7\xa8\xa9\xaa\xab\xac\xad\xae\xaf')).toBe(
        '/%C2%A0%C2%A1%C2%A2%C2%A3%C2%A4%C2%A5%C2%A6%C2%A7%C2%A8%C2%A9%C2%AA%C2%AB%C2%AC%C2%AD%C2%AE%C2%AF'
      )
      expect(encodeUrl('/\xb0\xb1\xb2\xb3\xb4\xb5\xb6\xb7\xb8\xb9\xba\xbb\xbc\xbd\xbe\xbf')).toBe(
        '/%C2%B0%C2%B1%C2%B2%C2%B3%C2%B4%C2%B5%C2%B6%C2%B7%C2%B8%C2%B9%C2%BA%C2%BB%C2%BC%C2%BD%C2%BE%C2%BF'
      )
      expect(encodeUrl('/\xc0\xc1\xc2\xc3\xc4\xc5\xc6\xc7\xc8\xc9\xca\xcb\xcc\xcd\xce\xcf')).toBe(
        '/%C3%80%C3%81%C3%82%C3%83%C3%84%C3%85%C3%86%C3%87%C3%88%C3%89%C3%8A%C3%8B%C3%8C%C3%8D%C3%8E%C3%8F'
      )
      expect(encodeUrl('/\xd0\xd1\xd2\xd3\xd4\xd5\xd6\xd7\xd8\xd9\xda\xdb\xdc\xdd\xde\xdf')).toBe(
        '/%C3%90%C3%91%C3%92%C3%93%C3%94%C3%95%C3%96%C3%97%C3%98%C3%99%C3%9A%C3%9B%C3%9C%C3%9D%C3%9E%C3%9F'
      )
      expect(encodeUrl('/\xe0\xe1\xe2\xe3\xe4\xe5\xe6\xe7\xe8\xe9\xea\xeb\xec\xed\xee\xef')).toBe(
        '/%C3%A0%C3%A1%C3%A2%C3%A3%C3%A4%C3%A5%C3%A6%C3%A7%C3%A8%C3%A9%C3%AA%C3%AB%C3%AC%C3%AD%C3%AE%C3%AF'
      )
      expect(encodeUrl('/\xf0\xf1\xf2\xf3\xf4\xf5\xf6\xf7\xf8\xf9\xfa\xfb\xfc\xfd\xfe\xff')).toBe(
        '/%C3%B0%C3%B1%C3%B2%C3%B3%C3%B4%C3%B5%C3%B6%C3%B7%C3%B8%C3%B9%C3%BA%C3%BB%C3%BC%C3%BD%C3%BE%C3%BF'
      )
    })
  })
  describe('when url contains percent-encoded sequences', () => {
    it('should not encode the "%" character', () => {
      expect(encodeUrl('http://localhost/%20snow.html')).toBe('http://localhost/%20snow.html')
    })

    it('should not care if sequence is valid UTF-8', () => {
      expect(encodeUrl('http://localhost/%F0snow.html')).toBe('http://localhost/%F0snow.html')
    })

    it('should encode the "%" if not a valid sequence', () => {
      expect(encodeUrl('http://localhost/%foo%bar%zap%')).toBe('http://localhost/%25foo%bar%25zap%25')
    })
  })
  describe('when url contains raw surrogate pairs', () => {
    it('should encode pair as UTF-8 byte sequences', () => {
      expect(encodeUrl('http://localhost/\uD83D\uDC7B snow.html')).toBe('http://localhost/%F0%9F%91%BB%20snow.html')
    })

    describe('when unpaired', () => {
      it('should encode as replacement character', () => {
        expect(encodeUrl('http://localhost/\uD83Dfoo\uDC7B <\uDC7B\uD83D>.html')).toBe(
          'http://localhost/%EF%BF%BDfoo%EF%BF%BD%20%3C%EF%BF%BD%EF%BF%BD%3E.html'
        )
      })

      it('should encode at end of string', () => {
        expect(encodeUrl('http://localhost/\uD83D')).toBe('http://localhost/%EF%BF%BD')
      })

      it('should encode at start of string', () => {
        expect(encodeUrl('\uDC7Bfoo')).toBe('%EF%BF%BDfoo')
      })
    })
  })
})
