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
  badges?: {
    emoji: boolean
    captions: boolean
  }
}

export const logger = (options: LoggerOptions = {}) => {
  const methods = options.methods ?? METHODS
  const timestamp = options.timestamp ?? false
  const output = options.output ?? { callback: console.log, color: true }
  const badge = options.badges ?? { emoji: false, captions: false };

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

        let badges = '';
        if (badge.emoji) {
          switch(s[0]) {
            case '2':
              badges = '🆗';
              break;
            case '4':
              if (s === '404') {
                badges = '🔎';
              } else {
                badges = '⚠️';
              }
              break;
            case '5':
              badges = '❌';
              break;
          }
        } 

        let captions = '';
        if(badge.captions) {
          switch(s[0]) {
            case '2':
              captions = 'ok';
              break;
            case '4': 
              if (s === '404') {
                  captions = 'mag_right'
              } else {
                captions = 'warning'
              }
              break;
            case '5':
              captions = 'x';
          }
        }

        if (!output.color) {
          const m = `${badges} ${captions} ${time}${method} ${status} ${msg} ${url}`;
          output.callback(m)
        } else {
          switch (s[0]) {
            case '2':
              status = cyan(bold(s))
              msg = cyan(msg)
              output.callback(`${badges} ${captions} ${time}${method} ${status} ${msg} ${url}`)
              break
            case '4':
              status = red(bold(s))
              msg = red(msg)
              output.callback(`${badges} ${captions} ${time}${method} ${status} ${msg} ${url}`)
              break
            case '5':
              status = magenta(bold(s))
              msg = magenta(msg)
              output.callback(`${badges} ${captions} ${time}${method} ${status} ${msg} ${url}`)
              break
          }
        }
      }
    })

    next?.()
  }
}

