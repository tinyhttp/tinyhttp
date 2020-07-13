import { IncomingMessage as Request, ServerResponse as Response } from 'http'
import { vary } from 'es-vary'

export interface AccessControlOptions {
  origin?: string | boolean | ((req: Request, res: Response) => string)
  methods?: string[]
  allowedHeaders?: string[]
  exposedHeaders?: string[]
  credentials?: boolean
  maxAge?: number
  optionsSuccessStatus?: number
}

/**
 * CORS Middleware
 */
export const cors = ({
  origin = '*',
  methods = ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  allowedHeaders,
  exposedHeaders,
  credentials,
  maxAge,
  optionsSuccessStatus = 204,
}: AccessControlOptions) => {
  return (req: Request, res: Response, next?: () => void) => {
    // Checking the type of the origin property
    if (typeof origin === 'boolean' && origin === true) res.setHeader('Access-Control-Allow-Origin', '*')
    else if (typeof origin === 'string') res.setHeader('Access-Control-Allow-Origin', origin)
    else if (typeof origin === 'function') res.setHeader('Access-Control-Allow-Origin', origin(req, res))
    if ((typeof origin === 'string' && origin !== '*') || typeof origin === 'function') vary(res, 'Origin')

    // Setting the Access-Control-Allow-Methods header from the methods array
    res.setHeader('Access-Control-Allow-Methods', methods.join(', ').toUpperCase())

    // Setting the Access-Control-Allow-Headers header
    if (allowedHeaders) res.setHeader('Access-Control-Allow-Headers', allowedHeaders)

    // Setting the Access-Control-Expose-Headers header
    if (exposedHeaders) res.setHeader('Access-Control-Expose-Headers', exposedHeaders)

    // Setting the Access-Control-Allow-Credentials header
    if (credentials) res.setHeader('Access-Control-Allow-Credentials', 'true')

    // Setting the Access-Control-Max-Age header
    if (maxAge) res.setHeader('Access-Control-Max-Age', maxAge)

    if (next === undefined) {
      res.statusCode = optionsSuccessStatus
      res.end()
    }

    next?.()
  }
}
