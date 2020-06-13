import { IncomingMessage } from 'http'
import { ParsedUrlQuery } from 'querystring'
import { parse } from 'url'

export const getQueryParams = (url = '/'): ParsedUrlQuery => {
  return parse(url, true).query
}

export default interface Request extends IncomingMessage {
  query: ParsedUrlQuery
}
