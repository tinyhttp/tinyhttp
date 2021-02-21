import rg from 'regexparam'
import * as qs from 'querystring'
import { ParsedUrlQuery } from 'querystring'

type Regex = {
  keys: string[]
  pattern: RegExp
}

export const getURLParams = ({ pattern, keys }: Regex, reqUrl = '/'): URLParams => {
  const matches = pattern.exec(reqUrl)

  const params = {}

  if (matches) for (let i = 0; i < keys.length; i++) params[keys[i]] = matches[i + 1]

  return params
}

export type URLParams = {
  [key: string]: string
}

export const getPathname = (u: string) => {
  const end = u.indexOf('?')

  return u.slice(0, end === -1 ? u.length : end)
}

export const getQueryParams = (url = '/'): ParsedUrlQuery => qs.parse(url.slice(url.indexOf('?') + 1))
