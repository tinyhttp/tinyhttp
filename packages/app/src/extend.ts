import { compile } from '@tinyhttp/proxy-addr'
import {
  checkIfXMLHttpRequest,
  getAccepts,
  getAcceptsCharsets,
  getAcceptsEncodings,
  getAcceptsLanguages,
  getFreshOrStale,
  getQueryParams,
  getRangeFromHeader,
  getRequestHeader
} from '@tinyhttp/req'
import {
  append,
  attachment,
  clearCookie,
  download,
  formatResponse,
  getResponseHeader,
  json,
  redirect,
  send,
  sendFile,
  sendStatus,
  setContentType,
  setCookie,
  setHeader,
  setLinksHeader,
  setLocationHeader,
  setVaryHeader,
  status
} from '@tinyhttp/res'
import type { NextFunction } from '@tinyhttp/router'
import type { App } from './app.js'
import { type Request, getSubdomains } from './request.js'
import { getHost, getIP, getIPs, getProtocol } from './request.js'
import type { Response } from './response.js'
import { renderTemplate } from './response.js'
import type { TemplateEngineOptions } from './types.js'

/**
 * Extends Request and Response objects with custom properties and methods
 */
export const extendMiddleware =
  <EngineOptions extends TemplateEngineOptions = TemplateEngineOptions>(app: App) =>
  (req: Request, res: Response<EngineOptions>, next: NextFunction): void => {
    const { settings } = app

    res.get = getResponseHeader(res)
    req.get = getRequestHeader(req)

    if (settings?.bindAppToReqRes) {
      req.app = app
      res.app = app
    }

    let trust = settings?.['trust proxy']
    if (typeof trust !== 'function') {
      trust = compile(trust)
      settings['trust proxy'] = trust
    }

    if (settings?.networkExtensions) {
      req.protocol = getProtocol(req, trust)
      req.secure = req.protocol === 'https'
      const host = getHost(req, trust)
      req.hostname = host?.hostname
      req.port = host?.port
      req.subdomains = getSubdomains(req, trust, settings.subdomainOffset)
      req.ip = getIP(req, trust)
      req.ips = getIPs(req, trust)
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
    res.render = renderTemplate(req, res, app)
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
