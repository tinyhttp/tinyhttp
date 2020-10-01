import Negotiator from 'negotiator'
import { IncomingMessage, IncomingHttpHeaders } from 'http'
import { lookup } from 'es-mime-types'

const extToMime = (type: string) => (type.indexOf('/') == -1 ? lookup(type) : type)

const validMime = (type: unknown) => typeof type == 'string'

export class Accepts {
  headers: IncomingHttpHeaders
  negotiator: Negotiator
  constructor(req: IncomingMessage) {
    this.headers = req.headers
    this.negotiator = new Negotiator(req)
  }
  /**
   * Check if the given `type(s)` is acceptable, returning the best match when true, otherwise `false`, in which case you should respond with 406 "Not Acceptable".
   *
   * The `type` value may be a single mime type string such as "application/json", the extension name such as "json" or an array `["json", "html", "text/plain"]`. When a list or array is given the _best_ match, if any is returned. When no types are given as arguments, returns all types accepted by the client in the preference order.
   */
  types(types: string | string[], ...args: string[]) {
    let mimeTypes: string[] = []

    // support flattened arguments
    if (types && !Array.isArray(types)) {
      mimeTypes = [types, ...args]
    } else if (types) {
      mimeTypes = [...types, ...args]
    }

    // no types, return all requested types
    if (!mimeTypes || mimeTypes.length == 0) {
      return this.negotiator.mediaTypes()
    }

    // no accept header, return first given type
    if (!this.headers['accept']) {
      return mimeTypes[0]
    }

    const mimes = mimeTypes.map(extToMime)
    const accepts = this.negotiator.mediaTypes(mimes.filter(validMime) as string[])
    const [first] = accepts

    return first ? mimeTypes[mimes.indexOf(first)] : false
  }
  get type() {
    return this.types
  }
  /**
   * Return accepted encodings or best fit based on `encodings`.
   *
   * Given `Accept-Encoding: gzip, deflate`
   * an array sorted by quality is returned:
   *
   *     ['gzip', 'deflate']
   */
  encodings(encodings: string | string[], ...args: string[]) {
    let _encodings: string[] = encodings as string[]

    // support flattened arguments
    if (_encodings && !Array.isArray(_encodings)) {
      _encodings = [_encodings, ...args]
    }

    // no encodings, return all requested encodings
    if (!_encodings || _encodings.length == 0) {
      return this.negotiator.encodings()
    }

    return this.negotiator.encodings(_encodings)[0] || false
  }
  get encoding() {
    return this.encodings
  }
  /**
   * Return accepted charsets or best fit based on `charsets`.
   *
   * Given `Accept-Charset: utf-8, iso-8859-1;q=0.2, utf-7;q=0.5`
   * an array sorted by quality is returned:
   *
   *     ['utf-8', 'utf-7', 'iso-8859-1']
   */
  charsets(charsets?: string | string[], ...args: string[]) {
    let _charsets: string[] = charsets as string[]

    // support flattened arguments
    if (_charsets && !Array.isArray(_charsets)) {
      _charsets = [_charsets, ...args]
    }

    // no charsets, return all requested charsets
    if (!_charsets || _charsets.length == 0) {
      return this.negotiator.charsets()
    }

    return this.negotiator.charsets(_charsets)[0] || false
  }
  get charset() {
    return this.charsets
  }
  /**
   * Return accepted languages or best fit based on `langs`.
   *
   * Given `Accept-Language: en;q=0.8, es, pt`
   * an array sorted by quality is returned:
   *
   *     ['es', 'pt', 'en']
   *
   */
  languages(languages: string | string[], ...args: string[]) {
    let _languages: string[] = languages as string[]

    // support flattened arguments
    if (_languages && !Array.isArray(_languages)) {
      _languages = [_languages, ...args]
    }

    // no languages, return all requested languages
    if (!_languages || _languages.length == 0) {
      return this.negotiator.languages()
    }

    return this.negotiator.languages(_languages)[0] || false
  }
  get lang() {
    return this.languages
  }
  get langs() {
    return this.languages
  }
  get language() {
    return this.languages
  }
}
