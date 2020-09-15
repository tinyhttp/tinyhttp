import { cyan, red, magenta, bold } from 'colorette'
import * as statusEmoji from 'http-status-emojis'
import dayjs from 'dayjs'
import { METHODS } from 'http'
import { Request, Response } from '@tinyhttp/app'

export interface LoggerOptions {
  methods?: string[]
  output?: {
    color: boolean
    callback: (string: string) => void
  }
  timestamp?: boolean | { format?: string }
  emoji?: boolean
  ip?: boolean
}

const joinOutputArgs = (args: (string | number)[], req: Request, res: Response, options: LoggerOptions = {}, status?: string, msg?: string) => {
  const { method, url } = req
  const { statusCode } = res

  const methods = options.methods ?? METHODS
  const timestamp = options.timestamp ?? false
  const emojiEnabled = options.emoji

  if (methods.includes(method)) {
    if (timestamp) {
      if (typeof timestamp !== 'boolean' && timestamp.format) {
        args.push(`${dayjs().format(timestamp.format).toString()} - `)
      } else {
        args.push(`${dayjs().format('HH:mm:ss').toString()} - `)
      }
    }
  }

  if (options.ip) args.push(req.ip)

  if (emojiEnabled) args.push(statusEmoji[statusCode])

  args.push(method)

  args.push(status || res.statusCode)
  args.push(msg || res.statusMessage)
  args.push(url)
}

export const logger = (options: LoggerOptions = {}) => {
  const methods = options.methods ?? METHODS
  const output = options.output ?? { callback: console.log, color: true }

  return (req: Request, res: Response, next?: () => void) => {
    res.on('finish', () => {
      const args: (string | number)[] = []

      if (methods.includes(req.method)) {
        const s = res.statusCode.toString()

        if (!output.color) {
          joinOutputArgs(args, req, res, options)
          const m = args.join(' ')
          output.callback(m)
        } else {
          switch (s[0]) {
            case '2':
              joinOutputArgs(args, req, res, options, cyan(bold(s)), cyan(res.statusMessage))
              output.callback(args.join(' '))
              break
            case '4':
              joinOutputArgs(args, req, res, options, red(bold(s)), red(res.statusMessage))
              output.callback(args.join(' '))
              break
            case '5':
              joinOutputArgs(args, req, res, options, magenta(bold(s)), magenta(res.statusMessage))
              output.callback(args.join(' '))
              break
          }
        }
      }
    })

    next?.()
  }
}
