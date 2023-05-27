import { createServer, IncomingMessage as Request, Server, ServerResponse as Response } from 'node:http'

export const runServer = (func: (req: Request, res: Response) => void): Server => {
  const s = createServer((req, res) => {
    func(req, res)
  })

  return s
}
