import type { Request, Response, App } from '@tinyhttp/app'

export type JSONPOptions = Partial<{
  escape: boolean
  replacer: (this: any, key: string, value: any) => any
  spaces: string | number
  callbackName: string
}>

function stringify(value: unknown, replacer: (this: any, key: string, value: any) => any, spaces: string | number, escape: boolean) {
  // v8 checks arguments.length for optimizing simple call
  // https://bugs.chromium.org/p/v8/issues/detail?id=4730
  let json = replacer || spaces ? JSON.stringify(value, replacer, spaces) : JSON.stringify(value)

  if (escape) {
    json = json.replace(/[<>&]/g, (c) => {
      switch (c.charCodeAt(0)) {
        case 0x3c:
          return '\\u003c'
        case 0x3e:
          return '\\u003e'
        case 0x26:
          return '\\u0026'
        default:
          return c
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
export const jsonp = (req: Request, res: Response, app: App) => (obj: unknown, opts?: JSONPOptions) => {
  const val = obj

  const { escape, replacer, spaces, callbackName } = opts

  let body = stringify(val, replacer, spaces, escape)

  let callback = req.query[app[callbackName]]

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
    body = '/**/ typeof ' + callback + " === 'function' && " + callback + '(' + body + ');'
  }

  return res.send(body)
}
