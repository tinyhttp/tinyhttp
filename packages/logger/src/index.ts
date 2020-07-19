import colors from 'colors'
import dayjs from 'dayjs'
import { IncomingMessage as Request, ServerResponse as Response, METHODS } from 'http'

interface LoggerProperties {
  methods?: string[]
  output?: {
    color: boolean
    callback: (string) => void
  }
  timestamp?: boolean | { format?: string }
}

export const logger = (options: LoggerProperties = {}) => {
  const methods = options.methods ?? METHODS
  const timestamp = options.timestamp ?? false
  const output = options.output ?? { callback: console.log, color: true }

  const logger = (req: Request, res: Response, next?: () => void) => {
    res.on('finish', () => {
      const { method, url } = req
      const { statusCode, statusMessage } = res

      if (method && methods.includes(method)) {
        const s = statusCode.toString()

        let status: string = s
        let msg: string = statusMessage

        let time = ''
        if (timestamp) {
          if (typeof timestamp !== 'boolean' && timestamp.format) {
            time += `${dayjs().format(timestamp.format).toString()} - `
          } else {
            time += `${dayjs().format('HH:mm:ss').toString()} - `
          }
        }

        if (!output.color) {
          output.callback(`${time}${method} ${status} ${msg} ${url}`)
        } else {
          switch (s[0]) {
            case '2':
              status = colors.cyan.bold(s)
              msg = colors.cyan(msg)
              output.callback(`${time}${method} ${status} ${msg} ${url}`)
              break
            case '4':
              status = colors.red.bold(s)
              msg = colors.red(msg)
              output.callback(`${time}${method} ${status} ${msg} ${url}`)
              break
            case '5':
              status = colors.magenta.bold(s)
              msg = colors.magenta(msg)
              output.callback(`${time}${method} ${status} ${msg} ${url}`)
              break
          }
        }
      }
    })

    next?.()
  }

  return logger
}
