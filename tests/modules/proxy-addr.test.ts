// Original test cases are taken from https://github.com/jshttp/proxy-addr/blob/master/test/test.js

import type { IncomingMessage } from 'node:http'
import { describe, expect, it } from 'vitest'
import { proxyaddr } from '../../packages/proxy-addr/src'
import { createReq } from '../../test_helpers/createReq'

const all = () => true

const none = () => false

function trust10x(addr: string) {
  return /^10\./.test(addr)
}

describe('proxyaddr(req, trust)', () => {
  describe('arguments', () => {
    describe('req', () => {
      it('should be required', () => {
        try {
          proxyaddr(null, null)
        } catch (error) {
          expect(error).toBeDefined()
        }
      })
    })

    describe('trust', () => {
      it('should be required', () => {
        const req = createReq('127.0.0.1') as IncomingMessage
        try {
          proxyaddr(req, null)
        } catch (error) {
          expect(error).toBeDefined()
        }
      })
      it('should accept a function', () => {
        const req = createReq('127.0.0.1') as IncomingMessage

        expect(proxyaddr(req, all)).toBe('127.0.0.1')
      })
      it('should accept an array', () => {
        const req = createReq('127.0.0.1') as IncomingMessage

        expect(proxyaddr(req, [])).toBe('127.0.0.1')
      })
      it('should accept a number', () => {
        const req = createReq('127.0.0.1') as IncomingMessage

        expect(proxyaddr(req, 1)).toBe('127.0.0.1')
      })
      it('should accept IPv4', () => {
        const req = createReq('127.0.0.1') as IncomingMessage

        expect(proxyaddr(req, '127.0.0.1')).toBe('127.0.0.1')
      })
      it('should accept IPv6', () => {
        const req = createReq('127.0.0.1') as IncomingMessage

        expect(proxyaddr(req, '::1')).toBe('127.0.0.1')
      })
      it('should accept IPv4-style IPv6', () => {
        const req = createReq('127.0.0.1') as IncomingMessage

        expect(proxyaddr(req, '::ffff:127.0.0.1')).toBe('127.0.0.1')
      })
      it('should accept pre-defined names', () => {
        const req = createReq('127.0.0.1') as IncomingMessage

        expect(proxyaddr(req, 'loopback')).toBe('127.0.0.1')
      })
      it('should accept pre-defined names in an array', () => {
        const req = createReq('127.0.0.1') as IncomingMessage

        expect(proxyaddr(req, ['loopback', '10.0.0.1'])).toBe('127.0.0.1')
      })
      it('should not alter input array', () => {
        const arr = ['loopback', '10.0.0.1']
        const req = createReq('127.0.0.1') as IncomingMessage

        expect(proxyaddr(req, arr)).toBe('127.0.0.1')
        expect(arr).toEqual(['loopback', '10.0.0.1'])
      })
      it('should reject non-IP', () => {
        const req = createReq('127.0.0.1') as IncomingMessage

        try {
          proxyaddr(req, 'blegh')
        } catch (e) {
          expect(e.message).toContain('invalid IP address')
        }
        try {
          proxyaddr(req, '10.0.300.1')
        } catch (e) {
          expect(e.message).toContain('invalid IP address')
        }
        try {
          proxyaddr(req, '::ffff:30.168.1.9000')
        } catch (e) {
          expect(e.message).toContain('invalid IP address')
        }
        try {
          proxyaddr(req, '-1')
        } catch (e) {
          expect(e.message).toContain('invalid IP address')
        }
      })
      it('should reject bad CIDR', () => {
        const req = createReq('127.0.0.1') as IncomingMessage

        try {
          proxyaddr(req, '10.0.0.1/internet')
        } catch (e) {
          expect(e.message).toContain('invalid range on address')
        }

        try {
          proxyaddr(req, '10.0.0.1/6000')
        } catch (e) {
          expect(e.message).toContain('invalid range on address')
        }

        try {
          proxyaddr(req, '::1/6000')
        } catch (e) {
          expect(e.message).toContain('invalid range on address')
        }

        try {
          proxyaddr(req, '::ffff:a00:2/136')
        } catch (e) {
          expect(e.message).toContain('invalid range on address')
        }

        try {
          proxyaddr(req, '::ffff:a00:2/-1')
        } catch (e) {
          expect(e.message).toContain('invalid range on address')
        }
      })
      it('should reject bad netmask', () => {
        const req = createReq('127.0.0.1') as IncomingMessage

        try {
          proxyaddr(req, '10.0.0.1/255.0.255.0')
        } catch (e) {
          expect(e.message).toContain('invalid range on address')
        }

        try {
          proxyaddr(req, '10.0.0.1/ffc0::')
        } catch (e) {
          expect(e.message).toContain('invalid range on address')
        }

        try {
          proxyaddr(req, 'fe80::/ffc0::')
        } catch (e) {
          expect(e.message).toContain('invalid range on address')
        }

        try {
          proxyaddr(req, 'fe80::/255.255.255.0')
        } catch (e) {
          expect(e.message).toContain('invalid range on address')
        }

        try {
          proxyaddr(req, '::ffff:a00:2/255.255.255.0')
        } catch (e) {
          expect(e.message).toContain('invalid range on address')
        }
      })
      it('should be invoked as trust(addr, i)', () => {
        const log = []

        const req = createReq('127.0.0.1', {
          'x-forwarded-for': '192.168.0.1, 10.0.0.1'
        }) as IncomingMessage

        proxyaddr(req, (addr, i) => {
          log.push([addr, i])
          return true
        })

        expect(log).toStrictEqual([
          ['127.0.0.1', 0],
          ['10.0.0.1', 1]
        ])
      })
    })
  })

  describe('with all trusted', () => {
    it('should return socket address with no headers', () => {
      const req = createReq('127.0.0.1') as IncomingMessage

      expect(proxyaddr(req, all)).toBe('127.0.0.1')
    })
    it('should return header value', () => {
      const req = createReq('127.0.0.1', {
        'x-forwarded-for': '10.0.0.1'
      }) as IncomingMessage

      expect(proxyaddr(req, all)).toBe('10.0.0.1')
    })
    it('should return furthest header value', () => {
      const req = createReq('127.0.0.1', {
        'x-forwarded-for': '10.0.0.1, 10.0.0.2'
      }) as IncomingMessage

      expect(proxyaddr(req, all)).toBe('10.0.0.1')
    })
  })

  describe('with none trusted', () => {
    it('should return socket address with no headers', () => {
      const req = createReq('127.0.0.1') as IncomingMessage

      expect(proxyaddr(req, none)).toBe('127.0.0.1')
    })
    it('should return socket address with headers', () => {
      const req = createReq('127.0.0.1', {
        'x-forwarded-for': '10.0.0.1'
      }) as IncomingMessage

      expect(proxyaddr(req, none)).toBe('127.0.0.1')
    })
  })

  describe('with some trusted', () => {
    it('should return socket address with no headers', () => {
      const req = createReq('127.0.0.1') as IncomingMessage

      expect(proxyaddr(req, trust10x)).toBe('127.0.0.1')
    })
    it('should return socket address when not trusted', () => {
      const req = createReq('127.0.0.1', {
        'x-forwarded-for': '10.0.0.1, 10.0.0.2'
      }) as IncomingMessage

      expect(proxyaddr(req, trust10x)).toBe('127.0.0.1')
    })
    it('should return header when socket trusted', () => {
      const req = createReq('10.0.0.1', {
        'x-forwarded-for': '192.168.0.1'
      }) as IncomingMessage

      expect(proxyaddr(req, trust10x)).toBe('192.168.0.1')
    })
    it('should return first untrusted after trusted', () => {
      const req = createReq('10.0.0.1', {
        'x-forwarded-for': '192.168.0.1, 10.0.0.2'
      }) as IncomingMessage

      expect(proxyaddr(req, trust10x)).toBe('192.168.0.1')
    })
    it('should not skip untrusted', () => {
      const req = createReq('10.0.0.1', {
        'x-forwarded-for': '10.0.0.3, 192.168.0.1, 10.0.0.2'
      }) as IncomingMessage

      expect(proxyaddr(req, trust10x)).toBe('192.168.0.1')
    })
  })

  describe('when given array', () => {
    it('should accept literal IP addresses', () => {
      const req = createReq('10.0.0.1', {
        'x-forwarded-for': '192.168.0.1, 10.0.0.2'
      }) as IncomingMessage

      expect(proxyaddr(req, ['10.0.0.1', '10.0.0.2'])).toBe('192.168.0.1')
    })
    it('should not trust non-IP addresses', () => {
      const req = createReq('10.0.0.1', {
        'x-forwarded-for': '192.168.0.1, 10.0.0.2, localhost'
      }) as IncomingMessage

      expect(proxyaddr(req, ['10.0.0.1', '10.0.0.2'])).toBe('localhost')
    })
    it('should return socket address if none match', () => {
      const req = createReq('10.0.0.1', {
        'x-forwarded-for': '192.168.0.1, 10.0.0.2'
      }) as IncomingMessage

      expect(proxyaddr(req, ['127.0.0.1', '192.168.0.100'])).toBe('10.0.0.1')
    })

    describe('when array is empty', () => {
      it('should return socket address', () => {
        const req = createReq('127.0.0.1') as IncomingMessage

        expect(proxyaddr(req, [])).toBe('127.0.0.1')
      })
      it('should return socket address with headers', () => {
        const req = createReq('127.0.0.1', {
          'x-forwarded-for': '10.0.0.1, 10.0.0.2'
        }) as IncomingMessage

        expect(proxyaddr(req, [])).toBe('127.0.0.1')
      })
    })
  })

  describe('when given IPv4 address', () => {
    it('should accept literal IP addresses', () => {
      const req = createReq('10.0.0.1', {
        'x-forwarded-for': '192.168.0.1, 10.0.0.2'
      }) as IncomingMessage

      expect(proxyaddr(req, ['10.0.0.1', '10.0.0.2'])).toBe('192.168.0.1')
    })
    it('should accept CIDR notation', () => {
      const req = createReq('10.0.0.1', {
        'x-forwarded-for': '192.168.0.1, 10.0.0.200'
      }) as IncomingMessage

      expect(proxyaddr(req, '10.0.0.2/26')).toBe('10.0.0.200')
    })
    it('should accept netmask notation', () => {
      const req = createReq('10.0.0.1', {
        'x-forwarded-for': '192.168.0.1, 10.0.0.200'
      }) as IncomingMessage

      expect(proxyaddr(req, '10.0.0.2/255.255.255.192')).toBe('10.0.0.200')
    })
  })
  describe('when given IPv6 address', () => {
    it('should accept literal IP addresses', () => {
      const req = createReq('fe80::1', {
        'x-forwarded-for': '2002:c000:203::1, fe80::2'
      }) as IncomingMessage

      expect(proxyaddr(req, ['fe80::1', 'fe80::2'])).toBe('2002:c000:203::1')
    })
    it('should accept CIDR notation', () => {
      const req = createReq('fe80::1', {
        'x-forwarded-for': '2002:c000:203::1, fe80::ff00'
      }) as IncomingMessage

      expect(proxyaddr(req, 'fe80::/125')).toBe('fe80::ff00')
    })
  })
  describe('with mixed IP versions', () => {
    it('should match respective versions', () => {
      const req = createReq('::1', {
        'x-forwarded-for': '2002:c000:203::1'
      }) as IncomingMessage

      expect(proxyaddr(req, ['127.0.0.1', '::1'])).toBe('2002:c000:203::1')
    })
    it('should not match IPv4 to IPv6', () => {
      const req = createReq('::1', {
        'x-forwarded-for': '2002:c000:203::1'
      }) as IncomingMessage

      expect(proxyaddr(req, '127.0.0.1')).toBe('::1')
    })
  })

  describe('with IPv4-mapped IPv6 addresses', () => {
    it('should match IPv4 trust to IPv6 request', () => {
      const req = createReq('::ffff:a00:1', {
        'x-forwarded-for': '192.168.0.1, 10.0.0.2'
      }) as IncomingMessage

      expect(proxyaddr(req, ['10.0.0.1', '10.0.0.2'])).toBe('192.168.0.1')
    })
    it('should match IPv4 netmask trust to IPv6 request', () => {
      const req = createReq('::ffff:a00:1', {
        'x-forwarded-for': '192.168.0.1, 10.0.0.2'
      }) as IncomingMessage

      expect(proxyaddr(req, ['10.0.0.1/16'])).toBe('192.168.0.1')
    })
    it('should match IPv6 trust to IPv4 request', () => {
      const req = createReq('10.0.0.1', {
        'x-forwarded-for': '192.168.0.1, 10.0.0.2'
      }) as IncomingMessage

      expect(proxyaddr(req, ['::ffff:a00:1', '::ffff:a00:2'])).toBe('192.168.0.1')
    })
    it('should match CIDR notation for IPv4-mapped address', () => {})
    it('should match CIDR notation for IPv4-mapped address mixed with IPv6 CIDR', () => {})
    it('should match CIDR notation for IPv4-mapped address mixed with IPv4 addresses', () => {})
  })

  describe('when given pre-defined names', () => {
    it('should accept single pre-defined name', () => {})
    it('should accept multiple pre-defined names', () => {})
  })

  describe('when header contains non-ip addresses', () => {
    it('should stop at first non-trusted non-ip', () => {})
    it('should stop at first non-trusted malformed ip', () => {})
    it('should provide all values to function', () => {})
  })

  describe('when socket address undefined', () => {
    it('should return undefined as address', () => {})
    it('should return undefined even with trusted headers', () => {})
  })

  describe('when given number', () => {
    describe.each<{ trust: number; address: string }>([
      { trust: 0, address: '10.0.0.1' },
      { trust: 1, address: '10.0.0.2' },
      { trust: 2, address: '192.168.0.1' }
    ])('with addresses 10.0.0.1, 10.0.0.2, 192.168.0.1', ({ trust, address }) => {
      const req = createReq('10.0.0.1', {
        'x-forwarded-for': '192.168.0.1, 10.0.0.2'
      }) as IncomingMessage

      it(`should use the address that is at most ${trust} hops away`, () => {
        expect(proxyaddr(req, trust)).toBe(address)
      })
    })
  })
})

describe('proxyaddr.all(req, trust?)', () => {
  describe('arguments', () => {
    describe('req', () => {
      it('should be required', () => {})
    })
    describe('trust', () => {
      it('should be optional', () => {})
    })
  })

  describe('with no headers', () => {
    it('should return socket address', () => {})
  })

  describe('with x-forwarded-for header', () => {
    it('should include x-forwarded-for', () => {})
    it('should include x-forwarded-for in the correct order', () => {})
  })

  describe('with trust argument', () => {
    it('should stop at first untrusted', () => {})
    it('should return only socket address when nothing is trusted', () => {})
  })
})

describe('proxyaddr.compile(trust)', () => {
  describe('arguments', () => {
    describe('trust', () => {
      it('should be required', () => {})
      it('should accept a string array', () => {})
      it('should accept a number', () => {})
      it('should accept IPv4', () => {})
      it('should accept IPv6', () => {})
      it('should accept IPv4-style IPv6', () => {})
      it('should accept pre-defined names', () => {})
      it('should accept pre-defined names in an array', () => {})
      it('should reject non-IP', () => {})
      it('should reject bad CIDR', () => {})
      it('should not alter input array', () => {})
    })
  })
})
