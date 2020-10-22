import { compile } from '@tinyhttp/proxy-addr'

export const compileTrust = (val: any) => {
  if (typeof val === 'function') return val

  if (val === true) {
    // Support plain true/false
    return function () {
      return true
    }
  }

  if (typeof val === 'number') {
    // Support trusting hop count
    return (_: unknown, i: number) => {
      if (val) {
        return i < val
      }
    }
  }

  if (typeof val === 'string') {
    // Support comma-separated values
    const vals = val.split(',').map((it) => it.trim())
    return compile(vals)
  }

  return compile(val || [])
}
