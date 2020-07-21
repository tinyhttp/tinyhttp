import { cyan, red, magenta, bold } from 'colorette'
import dayjs from 'dayjs'
import { IncomingMessage as Request, ServerResponse as Response, METHODS } from 'http'

export interface LoggerOptions {
  methods?: string[]
  output?: {
    color: boolean
    callback: (string) => void
  }
  timestamp?: boolean | { format?: string }
}

export const logger = (options: LoggerOptions = {}) => {
  const methods = options.methods ?? METHODS
  const timestamp = options.timestamp ?? false
  const output = options.output ?? { callback: console.log, color: true }

  return (req: Request, res: Response, next?: () => void) => {
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
              status = cyan(bold(s))
              msg = cyan(msg)
              output.callback(`${time}${method} ${status} ${msg} ${url}`)
              break
            case '4':
              status = red(bold(s))
              msg = red(msg)
              output.callback(`${time}${method} ${status} ${msg} ${url}`)
              break
            case '5':
              status = magenta(bold(s))
              msg = magenta(msg)
              output.callback(`${time}${method} ${status} ${msg} ${url}`)
              break
          }
        }
      }
    })

    next?.()
  }
}
