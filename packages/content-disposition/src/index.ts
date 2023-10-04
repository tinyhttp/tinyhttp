// eslint-disable-next-line no-control-regex
const ENCODE_URL_ATTR_CHAR_REGEXP = /[\x00-\x20"'()*,/:;<=>?@[\\\]{}\x7f]/g

const HEX_ESCAPE_REGEXP = /%[0-9A-Fa-f]{2}/
const HEX_ESCAPE_REPLACE_REGEXP = /%([0-9A-Fa-f]{2})/g

const NON_LATIN1_REGEXP = /[^\x20-\x7e\xa0-\xff]/g

// eslint-disable-next-line no-control-regex
const QESC_REGEXP = /\\([\u0000-\u007f])/g

const QUOTE_REGEXP = /([\\"])/g

const PARAM_REGEXP =
  /;[\x09\x20]*([!#$%&'*+.0-9A-Z^_`a-z|~-]+)[\x09\x20]*=[\x09\x20]*("(?:[\x20!\x23-\x5b\x5d-\x7e\x80-\xff]|\\[\x20-\x7e])*"|[!#$%&'*+.0-9A-Z^_`a-z|~-]+)[\x09\x20]*/g // eslint-disable-line no-control-regex
const TEXT_REGEXP = /^[\x20-\x7e\x80-\xff]+$/
const TOKEN_REGEXP = /^[!#$%&'*+.0-9A-Z^_`a-z|~-]+$/

const EXT_VALUE_REGEXP =
  /^([A-Za-z0-9!#$%&+\-^_`{}~]+)'(?:[A-Za-z]{2,3}(?:-[A-Za-z]{3}){0,3}|[A-Za-z]{4,8}|)'((?:%[0-9A-Fa-f]{2}|[A-Za-z0-9!#$&+.^_`|~-])+)$/

// eslint-disable-next-line no-control-regex
const DISPOSITION_TYPE_REGEXP = /^([!#$%&'*+.0-9A-Z^_`a-z|~-]+)[\x09\x20]*(?:$|;)/

const getlatin1 = (val: unknown) => {
  // simple Unicode -> ISO-8859-1 transformation
  return String(val).replace(NON_LATIN1_REGEXP, '?')
}

export class ContentDisposition {
  type: string
  parameters: Record<string, unknown>
  constructor(type: string, parameters: Record<string, unknown>) {
    this.type = type
    this.parameters = parameters
  }
}

const qstring = (val: unknown) => '"' + String(val).replace(QUOTE_REGEXP, '\\$1') + '"'

const pencode = (char: string) => '%' + String(char).charCodeAt(0).toString(16).toUpperCase()

function ustring(val: unknown): string {
  const str = String(val)

  // percent encode as UTF-8
  const encoded = encodeURIComponent(str).replace(ENCODE_URL_ATTR_CHAR_REGEXP, pencode)

  return "UTF-8''" + encoded
}

const basename = (str: string) => str.slice(str.lastIndexOf('/') + 1)

function format({
  parameters,
  type
}: Partial<{
  parameters: Record<string, unknown>
  type: string | boolean | undefined
}>) {
  if (!type || typeof type !== 'string' || !TOKEN_REGEXP.test(type)) {
    throw new TypeError('invalid type')
  }

  // start with normalized type
  let string = String(type).toLowerCase()
  // append parameters
  if (parameters && typeof parameters === 'object') {
    const params = Object.keys(parameters).sort()

    for (const param of params) {
      const val = param.slice(-1) === '*' ? ustring(parameters[param]) : qstring(parameters[param])

      string += '; ' + param + '=' + val
    }
  }

  return string
}

function createParams(filename?: string, fallback?: string | boolean) {
  if (filename === undefined) return

  const params: Partial<
    Record<string, string> & {
      filename: string
    }
  > = {}

  // fallback defaults to true
  if (!fallback) fallback = true
  if (typeof fallback === 'string' && NON_LATIN1_REGEXP.test(fallback)) {
    throw new TypeError('fallback must be ISO-8859-1 string')
  }

  // restrict to file base name
  const name = basename(filename)

  // determine if name is suitable for quoted string
  const isQuotedString = TEXT_REGEXP.test(name)

  // generate fallback name
  const fallbackName = typeof fallback !== 'string' ? fallback && getlatin1(name) : basename(fallback)
  const hasFallback = typeof fallbackName === 'string' && fallbackName !== name

  // set extended filename parameter
  if (hasFallback || !isQuotedString || HEX_ESCAPE_REGEXP.test(name)) {
    params['filename*'] = name
  }

  // set filename parameter
  if (isQuotedString || hasFallback) {
    params.filename = hasFallback ? fallbackName : name
  }

  return params
}

const pdecode = (_str: string, hex: string) => String.fromCharCode(parseInt(hex, 16))

/**
 * Create an attachment Content-Disposition header.
 *
 * @param filename file name
 * @param options
 */

export function contentDisposition(
  filename?: string,
  options: Partial<{
    type: string
    fallback: string | boolean
  }> = {}
): string {
  // format into string
  return format(new ContentDisposition(options.type || 'attachment', createParams(filename, options.fallback)))
}

function decodefield(str: string) {
  const match = EXT_VALUE_REGEXP.exec(str)
  if (!match) throw new TypeError('invalid extended field value')

  const charset = match[1].toLowerCase()
  const encoded = match[2]
  let value: string
  switch (charset) {
    case 'iso-8859-1':
      value = getlatin1(encoded.replace(HEX_ESCAPE_REPLACE_REGEXP, pdecode))
      break
    case 'utf-8':
      try {
        value = decodeURIComponent(encoded)
      } catch {
        throw new TypeError('invalid encoded utf-8')
      }
      break
    default:
      throw new TypeError('unsupported charset in extended field')
  }

  return value
}

/**
 * Parse Content-Disposition header string.
 * @param header string
 */
export function parse(header: string): ContentDisposition {
  let match = DISPOSITION_TYPE_REGEXP.exec(header)

  if (!match) throw new TypeError('invalid type format')

  // normalize type
  let index = match[0].length
  const type = match[1].toLowerCase()

  let key: string
  const names = []
  const params = {}
  let value: string | string[]

  // calculate index to start at
  index = PARAM_REGEXP.lastIndex = match[0].slice(-1) === ';' ? index - 1 : index

  // match parameters
  while ((match = PARAM_REGEXP.exec(header))) {
    if (match.index !== index) throw new TypeError('invalid parameter format')

    index += match[0].length
    key = match[1].toLowerCase()
    value = match[2]

    if (names.indexOf(key) !== -1) {
      throw new TypeError('invalid duplicate parameter')
    }

    names.push(key)

    if (key.indexOf('*') + 1 === key.length) {
      // decode extended value
      key = key.slice(0, -1)
      value = decodefield(value)

      // overwrite existing value
      params[key] = value
      continue
    }

    if (typeof params[key] === 'string') continue

    if (value[0] === '"') {
      value = value.slice(1, value.length - 1).replace(QESC_REGEXP, '$1')
    }

    params[key] = value
  }

  if (index !== -1 && index !== header.length) {
    throw new TypeError('invalid parameter format')
  }

  return new ContentDisposition(type, params)
}
