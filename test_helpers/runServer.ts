import { createServer, IncomingMessage as Request, ServerResponse as Response } from 'http'

export const runServer = (func: (req: Request, res: Response) => any) => {
  const s = createServer((req, res) => {
    func(req, res)
  })

  return s
}
