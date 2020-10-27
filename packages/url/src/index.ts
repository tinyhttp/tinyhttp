import rg from 'regexparam'
import { parse } from 'url'
import { ParsedUrlQuery } from 'querystring'

export const getURLParams = (reqUrl = '/', url = '/'): URLParams => {
  const tmp = rg(url)

  const matches = tmp.pattern.exec(reqUrl)

  const params = {}

  if (matches) {
    for (let i = 0; i < tmp.keys.length; i++) {
      params[tmp.keys[i]] = matches[i + 1]
    }
  }

  return params
}

export const getQueryParams = (url = '/'): ParsedUrlQuery => parse(url, true).query

export const matchParams = (path = '/', reqUrl = '/') => rg(path).pattern.test(reqUrl)

export type URLParams = {
  [key: string]: string
}
