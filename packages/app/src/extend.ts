import {
  Request,
  getQueryParams,
  getProtocol,
  getRangeFromHeader,
  checkIfXMLHttpRequest,
  getHostname,
  getRequestHeader,
  setRequestHeader,
  getFreshOrStale,
  getAccepts,
} from './request'
import { Response, send, json, status, setCookie, clearCookie, setHeader, getResponseHeader, setLocationHeader, setLinksHeader, sendStatus } from './response'
import { AppSettings } from './app'

/**
 * Extends Request and Response objects with custom properties and methods
 * @param options App settings
 */
export const extendMiddleware = (options: AppSettings) => (req: Request, res: Response) => {
  /// Define extensions

  res.get = getResponseHeader(req, res)
  req.get = getRequestHeader(req)

  /*
  Request extensions
  */

  if (options?.networkExtensions) {
    const proto = getProtocol(req)
    const secure = proto === 'https'

    req.protocol = proto
    req.secure = secure
    req.connection = Object.assign(req.socket, {
      encrypted: secure,
    })

    req.hostname = getHostname(req)
  }

  req.query = getQueryParams(req.url)

  if (options?.freshnessTesting) {
    req.fresh = getFreshOrStale(req, res)

    req.stale = !req.fresh
  }

  req.set = setRequestHeader(req)
  req.range = getRangeFromHeader(req)
  req.accepts = getAccepts(req)

  req.xhr = checkIfXMLHttpRequest(req)

  /*
  Response extensions
  */

  res.header = res.set = setHeader(req, res)

  res.send = send(req, res)
  res.json = json(req, res)
  res.status = status(req, res)
  res.sendStatus = sendStatus(req, res)
  res.location = setLocationHeader(req, res)
  res.links = setLinksHeader(req, res)

  res.cookie = setCookie(req, res)
  res.clearCookie = clearCookie(req, res)
}
