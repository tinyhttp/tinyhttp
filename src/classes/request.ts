import { IncomingMessage } from 'http'
import { ParsedUrlQuery } from 'querystring'
import rg from 'regexparam'
import { parse } from 'url'

export const getQueryParams = (url = '/'): ParsedUrlQuery => {
  return parse(url, true).query
}

export type URLParams = {
  [key: string]: string
}

const exec = (
  path: string,
  result: {
    pattern: RegExp
    keys: string[]
  }
) => {
  let i = 0,
    out = {}
  let matches = result.pattern.exec(path)
  while (i < result.keys.length) {
    out[result.keys[i]] = matches?.[++i] || null
  }
  return out
}

export const getURLParams = (reqUrl = '/', url = '/'): URLParams => {
  return exec(reqUrl, rg(url))
}

export default interface Request extends IncomingMessage {
  query: ParsedUrlQuery
  params: URLParams
}
