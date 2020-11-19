import { IncomingMessage as I, ServerResponse as Response } from 'http'
import { Accepts } from '@tinyhttp/accepts'

type Request = Pick<I, 'headers'>

export const getAccepts = (req: Request) => (...types: string[]) => new Accepts(req).types(types)

export const getAcceptsEncodings = (req: Request) => (...encodings: string[]) => new Accepts(req).encodings(encodings)

export const getAcceptsCharsets = (req: Request) => (...charsets: string[]) => new Accepts(req).charsets(charsets)

export const getAcceptsLanguages = (req: Request) => (...languages: string[]) => new Accepts(req).languages(languages)
