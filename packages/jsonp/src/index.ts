import type { Request, Response } from '@tinyhttp/app'

export type JSONPOptions = Partial<{
  escape: boolean
  replacer: (this: any, key: string, value: any) => any
  spaces: string | number
  callbackName: string
}>

function stringify(
  value: unknown,
  replacer: ((this: any, key: string, value: any) => any) | undefined,
  spaces: string | number | undefined,
  escapeChars: boolean | undefined
) {
  let json = replacer || spaces ? JSON.stringify(value, replacer, spaces) : JSON.stringify(value)

  if (escapeChars) {
    // @ts-expect-error not sure what should be the default escape char
    json = json.replace(/[<>&]/g, (c) => {
      switch (c.charCodeAt(0)) {
        case 0x3c:
          return '\\u003c'
        case 0x3e:
          return '\\u003e'
        case 0x26:
          return '\\u0026'
      }
    })
  }

  return json
}

/**
 * Send JSON response with JSONP callback support
 * @param req Request
 * @param res Response
 * @param app App
 */
export const jsonp =
  (req: Request, res: Response) =>
  (obj: unknown, opts: JSONPOptions = {}): Response => {
    const val = obj

    // biome-ignore lint/suspicious/noShadowRestrictedNames: <explanation>
    const { escape, replacer, spaces, callbackName = 'callback' } = opts

    let body = stringify(val, replacer, spaces, escape)

    let callback = req.query[callbackName]

    if (!res.get('Content-Type')) {
      res.set('X-Content-Type-Options', 'nosniff')
      res.set('Content-Type', 'application/json')
    }

    // jsonp
    if (typeof callback === 'string' && callback.length !== 0) {
      res.set('X-Content-Type-Options', 'nosniff')
      res.set('Content-Type', 'text/javascript')

      // restrict callback charset
      callback = callback.replace(/[^[\]\w$.]/g, '')

      // replace chars not allowed in JavaScript that are in JSON
      body = body.replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029')

      // the /**/ is a specific security mitigation for "Rosetta Flash JSONP abuse"
      // the typeof check is just to reduce client error noise
      body = `/**/ typeof ${callback} === 'function' && ${callback}(${body});`
    }

    return res.send(body)
  }
