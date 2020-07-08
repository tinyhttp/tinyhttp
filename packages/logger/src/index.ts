import colors from 'colors'
import { IncomingMessage as Request, ServerResponse as Response } from 'http'

const loggerHandler = (methods: string[] = ['GET', 'POST', 'PUT']) => {
  const logger = (req: Request, res: Response, next?: () => void) => {
    res.on('finish', () => {
      const { method, url } = req
      const { statusCode, statusMessage } = res

      if (method && methods.includes(method)) {
        const s = statusCode.toString()

        let status: string = s
        let msg: string = statusMessage

        switch (s[0]) {
          case '2':
            status = colors.cyan.bold(s)
            msg = colors.cyan(msg)
            console.log(`${method} ${status} ${msg} ${url}`)
            break
          case '4':
            status = colors.red.bold(s)
            msg = colors.red(msg)
            console.log(`${method} ${status} ${msg} ${url}`)
            break
          case '5':
            status = colors.magenta.bold(s)
            msg = colors.magenta(msg)
            console.error(`${method} ${status} ${msg} ${url}`)
            break
        }
      }
    })

    next?.()
  }

  return logger
}

export default loggerHandler
