import { getSubdomains, Request } from './request'
import type { NextFunction } from '@tinyhttp/router'
import type { Response } from './response'
import {
  getFreshOrStale,
  getRangeFromHeader,
  getRequestHeader,
  checkIfXMLHttpRequest,
  getQueryParams,
  getAccepts,
  getAcceptsCharsets,
  getAcceptsEncodings,
  getAcceptsLanguages
} from '@tinyhttp/req'
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
  append
} from '@tinyhttp/res'
import { renderTemplate } from './response'
import { App } from './app'

/**
 * Extends Request and Response objects with custom properties and methods
 */
export const extendMiddleware =
  <EngineOptions>(app: App) =>
  (req: Request, res: Response<EngineOptions>, next: NextFunction): void => {
    const { settings } = app

    res.get = getResponseHeader(res)
    req.get = getRequestHeader(req)

    if (settings?.bindAppToReqRes) {
      req.app = app
      res.app = app
    }

    if (settings?.networkExtensions) {
      req.protocol = getProtocol(req)
      req.secure = req.protocol === 'https'
      req.connection = Object.assign(req.socket, { encrypted: req.secure })
      req.hostname = getHostname(req)
      req.subdomains = getSubdomains(req, settings.subdomainOffset)
      req.ip = getIP(req)
      req.ips = getIPs(req)
    }

    req.query = getQueryParams(req.url)

    req.range = getRangeFromHeader(req)
    req.accepts = getAccepts(req)
    req.acceptsCharsets = getAcceptsCharsets(req)
    req.acceptsEncodings = getAcceptsEncodings(req)
    req.acceptsLanguages = getAcceptsLanguages(req)

    req.xhr = checkIfXMLHttpRequest(req)

    res.header = res.set = setHeader<Response>(res)
    res.send = send<Request, Response>(req, res)
    res.json = json<Response>(res)
    res.status = status<Response>(res)
    res.sendStatus = sendStatus<Request, Response>(req, res)
    res.sendFile = sendFile<Request, Response>(req, res)
    res.type = setContentType<Response>(res)
    res.location = setLocationHeader<Request, Response>(req, res)
    res.links = setLinksHeader<Response>(res)
    res.vary = setVaryHeader<Response>(res)
    res.cookie = setCookie<Request, Response>(req, res)
    res.clearCookie = clearCookie<Request, Response>(req, res)
    res.render = renderTemplate<EngineOptions>(req, res, app)
    res.format = formatResponse(req, res, next)
    res.redirect = redirect(req, res, next)
    res.attachment = attachment<Response>(res)
    res.download = download<Request, Response>(req, res)
    res.append = append<Response>(res)
    res.locals = res.locals || Object.create(null)

    Object.defineProperty(req, 'fresh', { get: getFreshOrStale.bind(null, req, res), configurable: true })
    req.stale = !req.fresh

    next()
  }
