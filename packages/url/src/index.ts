import { parse, ParsedUrlQuery } from 'querystring'

type Regex = {
  keys: string[] | false
  pattern: RegExp
}

export const getURLParams = ({ pattern, keys }: Regex, reqUrl = '/'): URLParams => {
  const matches = pattern.exec(reqUrl)

  const params = {}

  if (matches && typeof keys !== 'boolean')
    for (let i = 0; i < keys.length; i++) {
      params[keys[i]] = decodeURIComponent(matches[i + 1])
    }

  return params
}

export type URLParams = {
  [key: string]: string
}

export const getPathname = (u: string): string => {
  const end = u.indexOf('?')

  return u.slice(0, end === -1 ? u.length : end)
}

export const getQueryParams = (url = '/'): ParsedUrlQuery => parse(url.slice(url.indexOf('?') + 1))
