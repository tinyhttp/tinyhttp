import { IncomingMessage as Request, ServerResponse as Response } from 'http'

/**
 * Add X-Response-Time header field.
 */
export function ping(opts?: { round?: boolean }) {
  return function responseTime(_: Request, res: Response, next: (err?: any) => void): void {
    const start = process.hrtime()

    const delta = process.hrtime(start)

    // Format to high resolution time with nano time
    let time = delta[0] * 1000 + delta[1] / 1000000

    if (!opts?.round) time = Math.round(time)

    res.setHeader('X-Response-Time', `${time}ms`)

    next()
  }
}
