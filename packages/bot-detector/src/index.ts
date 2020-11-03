import type { Request, Response } from '@tinyhttp/app'
import type { Handler } from '@tinyhttp/router'
import detectBot from 'isbot'

export interface RequestWithBotDetector extends Request {
  isBot: boolean
  botName: string
}

export function botDetector(): Handler<RequestWithBotDetector, Response> {
  return (req, _, next) => {
    const agent = req.headers['user-agent']
    let bot
    let name

    Object.defineProperties(
      req,
      {
        isBot: {
          get: () => {
            if (typeof bot === 'boolean') {
              return bot
            }
            return bot = detectBot(agent)
          }
        },
        botName: {
          get: () => {
            if (!req.isBot) {
              name = null
            }
            if (typeof name === 'undefined') {
              name = detectBot.find(agent)
            }
            return name || undefined
          }
        }
      }
    )

    next()
  }
}
