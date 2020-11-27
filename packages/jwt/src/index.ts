import { IncomingMessage, ServerResponse as Response } from 'http'
import jwtoken, { Algorithm } from 'jsonwebtoken'

export interface JwtMwProps {
  secret: string | string[]
  algorithm?: Algorithm
  audience?: string
  issuer?: string
  expiresIn?: string
  notBefore?: string
  requestHeaderName?: string
  responseHeaderName?: string
  getToken?: (header: string) => string
}

export interface Request extends IncomingMessage {
  user?: any
}

const getTokenFromHeader = (header: string) => (!header ? '' : header.split(' ')[1])

/**
 * JWT middleware
 */
export const jwt = ({
  secret,
  algorithm = 'HS256',
  audience = '',
  issuer = '',
  expiresIn = '50y',
  notBefore = '0s',
  requestHeaderName = 'authorization',
  responseHeaderName = 'X-Token',
  getToken = getTokenFromHeader
}: JwtMwProps) => {
  return function (req: Request, res: Response, next?: () => void) {
    const token: string = getToken((req.headers[requestHeaderName] as string) ?? '')

    try {
      // Verify the JWT token
      const verify = jwtoken.verify(token, Array.isArray(secret) ? secret[1] : secret, {
        algorithms: [algorithm],
        audience,
        issuer
      })

      req.user = verify

      res.setHeader(
        responseHeaderName,
        jwtoken.sign(req.user, Array.isArray(secret) ? secret[0] : secret, {
          audience,
          issuer,
          expiresIn,
          notBefore,
          algorithm
        })
      )
      next()
    } catch {
      next()
    }
  }
}
