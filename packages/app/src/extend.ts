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
import { App } from '.'

export const extendMiddleware = (app: App) => (req: Request, res: Response) => {
  /// Define extensions

  /*
  Request extensions
  */

  req.app = app

  const proto = getProtocol(req)
  const secure = proto === 'https'

  req.protocol = proto
  req.secure = secure
  req.connection = Object.assign(req.socket, {
    encrypted: secure
  })

  req.query = getQueryParams(req.url)

  req.get = getRequestHeader(req)
  req.set = setRequestHeader(req)
  req.range = getRangeFromHeader(req)

  req.xhr = checkIfXMLHttpRequest(req)

  req.hostname = getHostname(req)

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
