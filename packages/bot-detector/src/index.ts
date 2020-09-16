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

    const isBot = detectBot(agent)

    if (isBot) {
      req.botName = detectBot.find(agent)
    }

    req.isBot = isBot

    next()
  }
}
