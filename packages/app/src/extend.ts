import { getSubdomains, Request } from './request'
import type { NextFunction } from '@tinyhttp/router'
import type { Response } from './response'

import { getFreshOrStale, getRangeFromHeader, getRequestHeader, checkIfXMLHttpRequest, getQueryParams, getAccepts, getAcceptsCharsets, getAcceptsEncodings } from '@tinyhttp/req'
import { getProtocol, getHostname, getIP, getIPs } from './request'
import {
  send,
  json,
  status,
  setCookie,
  clearCookie,
  setHeader,
  getResponseHeader,
  setLocationHeader,
  setLinksHeader,
  sendStatus,
  setVaryHeader,
  sendFile,
  formatResponse,
  redirect,
  setContentType,
  attachment,
  download,
  append,
} from '@tinyhttp/res'
import { renderTemplate } from './response'
import { App } from './app'

/**
 * Extends Request and Response objects with custom properties and methods
 * @param options App settings
 */
export const extendMiddleware = (app: App) => (req: Request, res: Response, next: NextFunction) => {
  const options = app.settings

  /// Define extensions

  req.originalUrl = req.url

  res.get = getResponseHeader(req, res)
  req.get = getRequestHeader(req)

  /**
    Bind `app` to `req` / `res`
   */
  if (options?.bindAppToReqRes) {
    req.app = app
    res.app = app
  }

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
    req.subdomains = getSubdomains(req, options.subdomainOffset)
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
  req.acceptsCharsets = getAcceptsCharsets(req)
  req.acceptsEncodings = getAcceptsEncodings(req)

  req.xhr = checkIfXMLHttpRequest(req)

  /*
  Response extensions
  */

  res.header = res.set = setHeader<Request, Response>(req, res)

  res.send = send<Request, Response>(req, res)
  res.json = json<Request, Response>(req, res)
  res.status = status<Request, Response>(req, res)
  res.sendStatus = sendStatus<Request, Response>(req, res)
  res.sendFile = sendFile<Request, Response>(req, res)

  res.type = setContentType<Request, Response>(req, res)
  res.location = setLocationHeader<Request, Response>(req, res)
  res.links = setLinksHeader<Request, Response>(req, res)
  res.vary = setVaryHeader<Request, Response>(req, res)

  res.cookie = setCookie<Request, Response>(req, res)
  res.clearCookie = clearCookie<Request, Response>(req, res)

  res.render = renderTemplate(req, res, app)

  res.format = formatResponse(req, res, next)

  res.redirect = redirect(req, res, next)

  res.attachment = attachment(req, res)
  res.download = download(req, res)

  res.append = append(req, res)

  res.locals = res.locals || Object.create(null)
}
