import { compile } from '@tinyhttp/proxy-addr'

export const compileTrust = (val: any) => {
  if (typeof val === 'function') return val

  // Support plain true/false
  if (val === true) return () => true

  if (typeof val === 'number') {
    // Support trusting hop count
    return (_: unknown, i: number) => {
      if (val) return i < val
    }
  }
  // Support comma-separated values
  if (typeof val === 'string') return compile(val.split(',').map((x) => x.trim()))

  return compile(val || [])
}
