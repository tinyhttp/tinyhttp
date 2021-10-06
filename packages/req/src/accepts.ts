import { IncomingMessage } from 'http'
import { Accepts } from '@tinyhttp/accepts'

type Request = Pick<IncomingMessage, 'headers'>

type AcceptReturns = string | boolean | string[]

export const getAccepts =
  (req: Request) =>
  (...types: string[]): AcceptReturns =>
    new Accepts(req).types(types)

export const getAcceptsEncodings =
  (req: Request) =>
  (...encodings: string[]): AcceptReturns =>
    new Accepts(req).encodings(encodings)

export const getAcceptsCharsets =
  (req: Request) =>
  (...charsets: string[]): AcceptReturns =>
    new Accepts(req).charsets(charsets)

export const getAcceptsLanguages =
  (req: Request) =>
  (...languages: string[]): AcceptReturns =>
    new Accepts(req).languages(languages)
