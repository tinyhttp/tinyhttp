import rg from 'regexparam'
import { parse } from 'url'
import { ParsedUrlQuery } from 'querystring'

export const rgExec = (path: string, result: { pattern: RegExp; keys: string[] }) => {
  let i = 0
  const out = {}
  const matches = result.pattern.exec(path)
  while (i < result.keys.length) {
    out[result.keys[i]] = matches?.[++i] || null
  }
  return out
}

export const getURLParams = (reqUrl = '/', url = '/'): URLParams => rgExec(reqUrl, rg(url))

export const getQueryParams = (url = '/'): ParsedUrlQuery => parse(url, true).query

export const matchParams = (path = '/', reqUrl = '/') => rg(path).pattern.test(reqUrl)

export type URLParams = {
  [key: string]: string
}
