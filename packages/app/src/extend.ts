import { Request } from './request'
import type { Response } from './response'

import { getQueryParams, getProtocol, getRangeFromHeader, checkIfXMLHttpRequest, getHostname, getIP, getIPs, getRequestHeader, getFreshOrStale, getAccepts } from './request'
import { send, json, status, setCookie, clearCookie, setHeader, getResponseHeader, setLocationHeader, setLinksHeader, sendStatus, renderTemplate } from './response'
import { App } from './app'
import { sendFile } from '@tinyhttp/res'

/**
 * Extends Request and Response objects with custom properties and methods
 * @param options App settings
 */
export const extendMiddleware = (app: App) => (req: Request, res: Response) => {
  const options = app.settings

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
    req.ip = getIP(req)
    req.ips = getIPs(req)
  }

  req.query = getQueryParams(req.url)

  if (options?.freshnessTesting) {
    req.fresh = getFreshOrStale(req, res)

    req.stale = !req.fresh
  }

  req.range = getRangeFromHeader(req)
  req.accepts = getAccepts(req)

  req.xhr = checkIfXMLHttpRequest(req)

  /*
  Response extensions
  */

  res.header = setHeader<Request, Response>(req, res)

  res.header = res.set = setHeader<Request, Response>(req, res)

  res.send = send<Request, Response>(req, res)
  res.json = json<Request, Response>(req, res)
  res.status = status<Request, Response>(req, res)
  res.sendStatus = sendStatus<Request, Response>(req, res)
  res.sendFile = sendFile<Request, Response>(req, res)

  res.location = setLocationHeader<Request, Response>(req, res)
  res.links = setLinksHeader<Request, Response>(req, res)

  res.cookie = setCookie<Request, Response>(req, res)
  res.clearCookie = clearCookie<Request, Response>(req, res)

  res.render = renderTemplate(req, res, app)
}
