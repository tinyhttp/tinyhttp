import {
  Request,
  getQueryParams,
  getURLParams,
  getRouteFromApp,
  getProtocol,
  getRangeFromHeader,
  checkIfXMLHttpRequest,
  getHostname,
  getRequestHeader,
  setRequestHeader
} from './request'
import { Response, send, json, status, setCookie, clearCookie, setHeader } from './response'
import { App } from './app'

export const extendMiddleware = (app: App) => (req: Request, res: Response) => {
  /// Define extensions

  /*
  Request extensions
  */

  // Request properties

  req.app = app

  const proto = getProtocol(req)
  const secure = proto === 'https'

  req.protocol = proto
  req.secure = secure
  req.connection = Object.assign(req.socket, {
    encrypted: secure
  })

  req.xhr = checkIfXMLHttpRequest(req)

  req.hostname = getHostname(req)

  req.query = getQueryParams(req.url)

  req.range = getRangeFromHeader(req)

  // Request methods

  req.get = getRequestHeader(req)
  req.set = setRequestHeader(req)

  /*
  Response extensions
  */
  res.app = app
  res.header = res.set = setHeader(req, res)
  res.send = send(req, res)
  res.json = json(req, res)
  res.status = status(req, res)

  res.cookie = setCookie(req, res)
  res.clearCookie = clearCookie(req, res)
}
