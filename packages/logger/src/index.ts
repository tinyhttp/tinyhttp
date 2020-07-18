import colors from 'colors'
import dayjs from 'dayjs';
import { IncomingMessage as Request, ServerResponse as Response, METHODS } from 'http'

interface Timestamp {
  format: string;
}

interface LoggerProperties {
  methods?: string[];
  timestamp?: Timestamp
}

const loggerHandler = (props: LoggerProperties) => {
  props = {
    methods: METHODS,
    ...props
  };

  const logger = (req: Request, res: Response, next?: () => void) => {
    res.on('finish', () => {
      const { method, url } = req
      const { statusCode, statusMessage } = res

      if (method && props.methods.includes(method)) {
        const s = statusCode.toString()

        let status: string = s
        let msg: string = statusMessage

        let timestamp = ''
        if (props.timestamp) {
          timestamp += `${dayjs().format(props.timestamp.format).toString()} - `
        }

        switch (s[0]) {
          case '2':
            status = colors.cyan.bold(s)
            msg = colors.cyan(msg)
            console.log(timestamp + `${method} ${status} ${msg} ${url}`)
            break
          case '4':
            status = colors.red.bold(s)
            msg = colors.red(msg)
            console.log(timestamp + `${method} ${status} ${msg} ${url}`)
            break
          case '5':
            status = colors.magenta.bold(s)
            msg = colors.magenta(msg)
            console.error(timestamp + `${method} ${status} ${msg} ${url}`)
            break
        }
      }
    })

    next?.()
  }

  return logger
}

export default loggerHandler
