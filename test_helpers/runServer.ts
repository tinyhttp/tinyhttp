import { createServer, type IncomingMessage as Request, type Server, type ServerResponse as Response } from 'node:http'

export const runServer = (func: (req: Request, res: Response) => void): Server => {
  const s = createServer((req, res) => {
    func(req, res)
  })

  return s
}
