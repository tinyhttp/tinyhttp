import { IncomingMessage as Request, ServerResponse as Response } from 'http'

export const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'HEAD']

const cors = ({ host = '*', methods = METHODS, headers = ['Origin', 'X-Requested-With', 'Content-Type'] }) => {
  const prefix = 'Access-Control-Allow'

  return (_req: Request, res: Response) => {
    res.setHeader(`${prefix}-Origin`, host)
    res.setHeader(`${prefix}-Headers`, headers.join(', '))
    res.setHeader(`${prefix}-Methods`, methods.join(', '))
  }
}

export default cors
