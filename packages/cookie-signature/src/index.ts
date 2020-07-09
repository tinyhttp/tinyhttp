import { createHmac, timingSafeEqual } from 'crypto'

/**
 * Sign the given `val` with `secret`.
 */
export const sign = (val: string, secret: string) => {
  return `${val}.${createHmac('sha256', secret).update(val).digest('base64').replace(/=+$/, '')}`
}

/**
 * Unsign and decode the given `val` with `secret`,
 * returning `false` if the signature is invalid.
 */
export const unsign = (val: string, secret: string) => {
  const str = val.slice(0, val.lastIndexOf('.')),
    mac = sign(str, secret),
    macBuffer = Buffer.from(mac),
    valBuffer = Buffer.alloc(macBuffer.length)

  valBuffer.write(val)
  return timingSafeEqual(macBuffer, valBuffer) ? str : false
}
