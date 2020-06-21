import proxyAddr from 'proxy-addr'

export const compileTrust = (val: any) => {
  if (typeof val === 'function') return val

  if (val === true) {
    // Support plain true/false
    return function() {
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
    val = val.split(/ *, */)
  }

  return proxyAddr.compile(val || [])
}

export const rgExec = (
  path: string,
  result: {
    pattern: RegExp
    keys: string[]
  }
) => {
  let i = 0,
    out = {}
  let matches = result.pattern.exec(path)
  while (i < result.keys.length) {
    out[result.keys[i]] = matches?.[++i] || null
  }
  return out
}
