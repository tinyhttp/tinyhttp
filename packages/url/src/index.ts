import { parse, type ParsedUrlQuery } from 'node:querystring'

type Regex = {
  keys: string[] | false
  pattern: RegExp
}

export const getURLParams = ({ pattern, keys }: Regex, reqUrl = '/'): URLParams => {
  const matches = pattern.exec(reqUrl)

  const params = {}

  if (matches && typeof keys !== 'boolean')
    for (let i = 0; i < keys.length; i++) {
      if (matches[i + 1]) {
        params[keys[i]] = decodeURIComponent(matches[i + 1])
      }
    }

  return params
}

export type URLParams = {
  [key: string]: string
}

const getQueryIndex = (url: string): number => {
  const index = url.indexOf('?')
  return index === -1 ? url.length : index
}

export const getPathname = (url: string): string => url.slice(0, getQueryIndex(url))

export const getQueryParams = (url = '/'): ParsedUrlQuery => parse(url.slice(getQueryIndex(url) + 1))
