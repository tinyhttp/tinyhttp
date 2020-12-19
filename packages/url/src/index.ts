import rg from 'regexparam'
import { parse } from 'url'
import { ParsedUrlQuery } from 'querystring'

type Regex = {
  keys: string[]
  pattern: RegExp
}

export const getURLParams = ({ pattern, keys }: Regex, reqUrl = '/'): URLParams => {
  const matches = pattern.exec(reqUrl)

  const params = {}

  if (matches) {
    for (let i = 0; i < keys.length; i++) params[keys[i]] = matches[i + 1]
  }

  return params
}

export const runRegex = (path = '/') => rg(path)

export const getQueryParams = (url = '/'): ParsedUrlQuery => parse(url, true).query

export const matchParams = ({ pattern }: Regex, reqUrl = '/') => pattern.test(reqUrl)

export type URLParams = {
  [key: string]: string
}

export const matchLoose = (path = '/', reqUrl = '/') => rg(path, true).pattern.test(reqUrl)
