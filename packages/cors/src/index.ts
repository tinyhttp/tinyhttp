import {
  IncomingMessage as Request,
  ServerResponse as Response,
  METHODS,
} from 'http'

export const defaultMethods = METHODS

export const defaultHeaders = ['Origin', 'X-Requested-With', 'Content-Type']

/**
 * CORS Middleware
 */
export const cors = ({
  host = '*',
  methods = defaultMethods,
  headers = defaultHeaders,
}) => {
  const prefix = 'Access-Control-Allow'

  return (_req: Request, res: Response, next?: (err?: any) => void) => {
    res.setHeader(`${prefix}-Origin`, host)
    res.setHeader(`${prefix}-Headers`, headers.join(', '))
    res.setHeader(`${prefix}-Methods`, methods.join(', '))

    next?.()
  }
}
