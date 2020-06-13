import colors from 'colors'
import { Handler } from '../index'
import Request from '../classes/request'
import Response from '../classes/response'

const loggerHandler = (methods: string[] = ['GET', 'POST', 'PUT']): Handler => {
  const logger = (req: Request, res: Response) => {
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
          break
        case '4':
          status = colors.red.bold(s)
          msg = colors.red(msg)
          break
        case '5':
          status = colors.magenta.bold(s)
          msg = colors.magenta(msg)
          break
      }

      console.log(`${status} ${msg} ${url}`)
    }
  }

  return logger
}

export default loggerHandler
