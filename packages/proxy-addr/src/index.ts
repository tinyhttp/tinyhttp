import type { IncomingMessage } from 'node:http'
import { forwarded } from '@tinyhttp/forwarded'
import ipaddr, { type IPv6, type IPv4 } from 'ipaddr.js'

type Req = Pick<IncomingMessage, 'headers' | 'socket'>

type Trust = ((addr: string, i: number) => boolean) | number[] | string[] | string

const DIGIT_REGEXP = /^[0-9]+$/
const isip = ipaddr.isValid
const parseip = ipaddr.parse
/**
 * Pre-defined IP ranges.
 */
const IP_RANGES = {
  linklocal: ['169.254.0.0/16', 'fe80::/10'],
  loopback: ['127.0.0.1/8', '::1/128'],
  uniquelocal: ['10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16', 'fc00::/7']
}

/**
 * Type-guard to determine whether a string value represents a pre-defined IP range.
 *
 * @param val
 */
function isIPRangeName(val: string): val is keyof typeof IP_RANGES {
  return Object.prototype.hasOwnProperty.call(IP_RANGES, val)
}
/**
 * Static trust function to trust nothing.
 */
const trustNone = () => false

/**
 * Get all addresses in the request, optionally stopping
 * at the first untrusted.
 *
 * @param request
 * @param trust
 */
function alladdrs(req: Req, trust: Trust): string[] {
  // get addresses

  const addrs = forwarded(req)

  if (!trust) return addrs

  if (typeof trust !== 'function') trust = compile(trust)

  for (let i = 0; i < addrs.length - 1; i++) {
    if (trust(addrs[i], i)) continue
    addrs.length = i + 1
  }
  return addrs
}
/**
 * Compile argument into trust function.
 *
 * @param  val
 */
function compile(val: string | number | (string | number)[]): (addr: string) => boolean {
  let trust: string[]
  if (typeof val === 'string') trust = [val]
  else if (typeof val === 'number') trust = [String(val)]
  else if (Array.isArray(val)) trust = val.map(String)
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
 * Compile `arr` elements into range subnets.
 */
function compileRangeSubnets(arr: string[]) {
  const rangeSubnets = new Array(arr.length)
  for (let i = 0; i < arr.length; i++) rangeSubnets[i] = parseIPNotation(arr[i])

  return rangeSubnets
}
/**
 * Compile range subnet array into trust function.
 *
 * @param rangeSubnets
 */
function compileTrust(rangeSubnets: (IPv4 | IPv6)[]) {
  // Return optimized function based on length
  const len = rangeSubnets.length
  return len === 0 ? trustNone : len === 1 ? trustSingle(rangeSubnets[0]) : trustMulti(rangeSubnets)
}
/**
 * Parse IP notation string into range subnet.
 *
 * @param {String} note
 * @private
 */
export function parseIPNotation(note: string): [IPv4 | IPv6, string | number] {
  const pos = note.lastIndexOf('/')
  const str = pos !== -1 ? note.substring(0, pos) : note

  if (!isip(str)) throw new TypeError(`invalid IP address: ${str}`)

  let ip = parseip(str)

  if (pos === -1 && ip.kind() === 'ipv6') {
    ip = ip as IPv6

    if (ip.isIPv4MappedAddress()) ip = ip.toIPv4Address()
  }

  const max = ip.kind() === 'ipv6' ? 128 : 32

  let range: string | number = pos !== -1 ? note.substring(pos + 1, note.length) : null

  if (range === null) range = max
  else if (DIGIT_REGEXP.test(range)) range = Number.parseInt(range, 10)
  else if (ip.kind() === 'ipv4' && isip(range)) range = parseNetmask(range)
  else range = null

  if (typeof range === 'number' && (range <= 0 || range > max)) throw new TypeError(`invalid range on address: ${note}`)

  return [ip, range]
}
/**
 * Parse netmask string into CIDR range.
 *
 * @param netmask
 * @private
 */
function parseNetmask(netmask: string) {
  const ip = parseip(netmask)
  return ip.kind() === 'ipv4' ? ip.prefixLengthFromSubnetMask() : null
}
/**
 * Determine address of proxied request.
 *
 * @param request
 * @param trust
 * @public
 */
export function proxyaddr(req: Req, trust: Trust): string {
  const addrs = alladdrs(req, trust)

  return addrs[addrs.length - 1]
}

/**
 * Compile trust function for multiple subnets.
 */
function trustMulti(subnets: (IPv4 | IPv6)[]) {
  return function trust(addr: string) {
    if (!isip(addr)) return false
    const ip = parseip(addr)
    let ipconv: IPv4 | IPv6
    const kind = ip.kind()
    for (let i = 0; i < subnets.length; i++) {
      const subnet = subnets[i]
      const subnetip = subnet[0]
      const subnetkind = subnetip.kind()
      const subnetrange = subnet[1]
      let trusted = ip
      if (kind !== subnetkind) {
        if (subnetkind === 'ipv4' && !(ip as IPv6).isIPv4MappedAddress()) continue

        if (!ipconv) ipconv = subnetkind === 'ipv4' ? (ip as IPv6).toIPv4Address() : (ip as IPv4).toIPv4MappedAddress()

        trusted = ipconv
      }
      if ((trusted as IPv4).match(subnetip, subnetrange)) return true
    }
    return false
  }
}
/**
 * Compile trust function for single subnet.
 *
 * @param subnet
 */
function trustSingle(subnet: IPv4 | IPv6) {
  const subnetip = subnet[0]
  const subnetkind = subnetip.kind()
  const subnetisipv4 = subnetkind === 'ipv4'
  const subnetrange = subnet[1]
  return function trust(addr: string) {
    if (!isip(addr)) return false
    let ip = parseip(addr)
    const kind = ip.kind()
    if (kind !== subnetkind) {
      if (subnetisipv4 && !(ip as IPv6).isIPv4MappedAddress()) return false

      ip = subnetisipv4 ? (ip as IPv6).toIPv4Address() : (ip as IPv4).toIPv4MappedAddress()
    }
    return (ip as IPv6).match(subnetip, subnetrange)
  }
}

export { alladdrs as all }
export { compile }
