import type { IncomingMessage } from 'node:http'
import { BlockList, isIP } from 'node:net'
import { forwarded } from '@tinyhttp/forwarded'

type Req = Pick<IncomingMessage, 'headers' | 'socket'>

export type TrustParameter = string | number | string[]
export type TrustFunction = (addr: string, i: number) => boolean
export type Trust = TrustFunction | TrustParameter

type Subnet = {
  ip: string
  range: number
  isIPv6: boolean
}

const DIGIT_REGEXP = /^[0-9]+$/
const isip = (ip: string) => isIP(ip) !== 0

/**
 * Pre-defined IP ranges.
 */
const IP_RANGES = {
  linklocal: ['169.254.0.0/16', 'fe80::/10'],
  loopback: ['127.0.0.1/8', '::1/128'],
  uniquelocal: ['10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16', 'fc00::/7']
}

/**
 * Check if an IPv6 address is an IPv4-mapped address (::ffff:x.x.x.x)
 */
function isIPv4Mapped(addr: string): boolean {
  if (isIP(addr) !== 6) return false
  const lower = addr.toLowerCase()
  return lower.startsWith('::ffff:') || lower.startsWith('0:0:0:0:0:ffff:')
}

/**
 * Convert IPv4-mapped IPv6 address to IPv4.
 * Handles both ::ffff:x.x.x.x and ::ffff:xxxx:xxxx formats.
 */
function mappedToIPv4(addr: string): string | null {
  if (!isIPv4Mapped(addr)) return null
  const lower = addr.toLowerCase()
  const suffix = lower.startsWith('::ffff:') ? addr.substring(7) : addr.substring(15)

  // Dotted decimal format (::ffff:127.0.0.1)
  if (suffix.includes('.')) return suffix

  // Hex format (::ffff:a00:1 -> 10.0.0.1)
  const parts = suffix.split(':')
  if (parts.length === 2) {
    const high = Number.parseInt(parts[0], 16)
    const low = Number.parseInt(parts[1], 16)
    return `${(high >> 8) & 0xff}.${high & 0xff}.${(low >> 8) & 0xff}.${low & 0xff}`
  }
  return null
}

/**
 * Normalize an IP address - converts IPv4-mapped IPv6 to plain IPv4.
 */
function normalizeIP(addr: string): string {
  const mapped = mappedToIPv4(addr)
  return mapped ?? addr
}

/**
 * Convert netmask string to CIDR prefix length.
 * Returns null for invalid netmasks.
 */
function netmaskToPrefix(netmask: string): number | null {
  if (isIP(netmask) !== 4) return null

  const parts = netmask.split('.').map(Number)

  // Convert to binary and count leading 1s
  const binary = parts.map((p) => p.toString(2).padStart(8, '0')).join('')
  const firstZero = binary.indexOf('0')

  // All 1s = /32
  if (firstZero === -1) return 32

  // Validate it's a valid netmask (all 1s followed by all 0s)
  if (binary.substring(firstZero).includes('1')) return null

  return firstZero
}

/**
 * Type-guard to determine whether a string value represents a pre-defined IP range.
 */
function isIPRangeName(val: string): val is keyof typeof IP_RANGES {
  return Object.hasOwn(IP_RANGES, val)
}

/**
 * Static trust function to trust nothing.
 */
const trustNone = () => false

/**
 * Get all addresses in the request, optionally stopping
 * at the first untrusted.
 */
function alladdrs(req: Req, trust?: Trust): string[] {
  const addrs = forwarded(req)

  if (trust == null) return addrs

  if (typeof trust !== 'function') trust = compile(trust)

  for (let i = 0; i < addrs.length - 1; i++) {
    if (trust(addrs[i], i)) continue
    addrs.length = i + 1
  }
  return addrs
}

/**
 * Compile argument into trust function.
 */
function compile(val: string | number | string[]): (addr: string, i: number) => boolean {
  let trust: string[]
  if (typeof val === 'string') trust = [val]
  else if (typeof val === 'number') return compileHopsTrust(val)
  else if (Array.isArray(val)) trust = val.slice()
  else throw new TypeError('unsupported trust argument')

  for (let i = 0; i < trust.length; i++) {
    const element = trust[i]
    if (!isIPRangeName(element)) continue

    // Splice in pre-defined range
    const namedRange = IP_RANGES[element]
    trust.splice(i, 1, ...namedRange)
    i += namedRange.length - 1
  }
  return compileTrust(compileRangeSubnets(trust))
}

/**
 * Compile 'hops' number into trust function.
 */
function compileHopsTrust(hops: number): (_: string, i: number) => boolean {
  return (_, i) => i < hops
}

/**
 * Compile `arr` elements into range subnets.
 */
function compileRangeSubnets(arr: string[]) {
  return arr.map((ip) => parseIPNotation(ip))
}

/**
 * Compile range subnet array into trust function.
 */
function compileTrust(rangeSubnets: Subnet[]) {
  const len = rangeSubnets.length
  if (len === 0) return trustNone

  // Build a BlockList with all subnets
  const blockList = new BlockList()

  for (const subnet of rangeSubnets) {
    if (subnet.isIPv6) {
      blockList.addSubnet(subnet.ip, subnet.range, 'ipv6')
    } else {
      blockList.addSubnet(subnet.ip, subnet.range, 'ipv4')
    }
  }

  return function trust(addr: string) {
    if (!isip(addr)) return false

    // Normalize the address (convert IPv4-mapped to plain IPv4)
    const normalized = normalizeIP(addr)
    const type = isIP(normalized) === 6 ? 'ipv6' : 'ipv4'

    return blockList.check(normalized, type)
  }
}

/**
 * Parse IP notation string into range subnet.
 */
export function parseIPNotation(note: string): Subnet {
  const pos = note.lastIndexOf('/')
  const str = pos !== -1 ? note.substring(0, pos) : note

  if (!isip(str)) throw new TypeError(`invalid IP address: ${str}`)

  // Check if original was IPv6 before normalization
  const originalIsIPv6 = isIP(str) === 6

  // Normalize IPv4-mapped addresses to plain IPv4
  let ip = normalizeIP(str)
  let isIPv6 = isIP(ip) === 6
  const max = isIPv6 ? 128 : 32

  if (pos === -1) {
    return { ip, range: max, isIPv6 }
  }

  const rangeString = note.substring(pos + 1, note.length)
  let range: number | null = null

  if (DIGIT_REGEXP.test(rangeString)) {
    range = Number.parseInt(rangeString, 10)

    // If original was IPv4-mapped, adjust the range from /128 space to /32 space
    if (str !== ip && originalIsIPv6) {
      // Original was IPv4-mapped IPv6 (e.g., ::ffff:a00:2/122)
      // Convert range: subtract 96 (128 - 32) to get IPv4 equivalent
      range = range - 96
    }
  } else if (!isIPv6 && !originalIsIPv6 && isip(rangeString)) {
    // Only allow netmask notation for originally-IPv4 addresses
    range = netmaskToPrefix(rangeString)
  }

  if (range == null || range <= 0 || range > max) throw new TypeError(`invalid range on address: ${note}`)
  return { ip, range, isIPv6 }
}

/**
 * Determine address of proxied request.
 */
export function proxyaddr(req: Req, trust: Trust): string {
  const addrs = alladdrs(req, trust)
  return addrs[addrs.length - 1]
}

export { alladdrs as all }
export { compile }
