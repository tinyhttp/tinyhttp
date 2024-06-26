import { type IncomingMessage as Request, type ServerResponse as Response, type Server, createServer } from 'node:http'

export const runServer = (func: (req: Request, res: Response) => void): Server => {
  const s = createServer((req, res) => {
    func(req, res)
  })

  return s
}
