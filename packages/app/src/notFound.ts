import { Handler } from './index'
import { Request } from './request'
import { Response } from './response'

export const notFound = (): Handler => {
  const notFound = (_: Request, res: Response) => {
    res.statusCode = 404
    res.end('Not found')
  }
  return notFound
}
