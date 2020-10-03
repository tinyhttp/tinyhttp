import { Store as ExpressStore } from 'express-session'
import { IncomingMessage, ServerResponse } from 'http'
import { EventEmitter } from 'events'
import * as cookie from '@tinyhttp/cookie'
import type { SerializeOptions } from '@tinyhttp/cookie'
import url from 'url'
import * as signature from '@tinyhttp/cookie-signature'
import { createHash } from 'crypto'
import { nanoid } from 'nanoid'
import onHeaders from 'on-headers'

function generateSessionId(): string {
  return nanoid(24)
}

interface ReqAndSessionInfo extends IncomingMessage {
  sessionID: string
  session: Session
  sessionStore: Store
}

function hash(sess: any): string {
  // serialize
  const str = JSON.stringify(sess, (key, val) => {
    // ignore sess.cookie property
    if (key === 'cookie' || key == 'store') {
      return
    }

    return val
  })

  // hash
  return createHash('sha1').update(str, 'utf8').digest('hex')
}

class Cookie implements Express.SessionCookie {
  _expires: Date | boolean = false
  originalMaxAge: number
  secure = false
  httpOnly = true
  path = '/'
  domain?: string
  sameSite: boolean | 'lax' | 'strict' | 'none' | undefined

  constructor(options?: Express.SessionCookieData) {
    const opts: Partial<Express.SessionCookieData> = options || {}

    this.expires = opts.expires || false
    this.path = opts.path || '/'
    this.maxAge = opts.maxAge
    this.originalMaxAge = opts.originalMaxAge === undefined ? opts.maxAge || 0 : opts.originalMaxAge
    this.domain = opts.domain
    this.sameSite = opts.sameSite as 'lax' | 'strict' | 'none'
  }

  set expires(to: Date | boolean) {
    this._expires = to
    if (this.maxAge) this.originalMaxAge = this.maxAge
  }

  get expires(): Date | boolean {
    return this._expires
  }

  set maxAge(ms: number | null) {
    this.expires = ms ? new Date(Date.now() + ms) : false
  }

  get maxAge(): number | null {
    return this.expires instanceof Date ? this.expires.valueOf() - Date.now() : null
  }

  get data() {
    return {
      originalMaxAge: this.originalMaxAge,
      expires: this._expires instanceof Date ? this._expires : undefined,
      secure: this.secure,
      httpOnly: this.httpOnly,
      domain: this.domain,
      path: this.path,
      sameSite: this.sameSite,
    }
  }

  serialize(name: string, val: string) {
    return cookie.serialize(name, val, this.data)
  }
}

export class Session implements Express.Session {
  id: string
  req: any
  store: Store
  cookie: Cookie;
  [key: string]: any

  constructor(req: any, sessionData: any) {
    Object.defineProperty(this, 'req', {
      value: req,
    })
    this.id = ''
    Object.defineProperty(this, 'id', {
      value: req.sessionID,
    })

    this.store = req.sessionStore
    this.cookie = sessionData.cookie

    if (typeof sessionData == 'object') {
      for (const prop in sessionData) {
        if (!(prop in this)) {
          this[prop] = sessionData[prop]
        }
      }
    }
  }

  resetMaxAge() {
    this.cookie.maxAge = this.cookie.originalMaxAge
    return this
  }

  touch() {
    this.resetMaxAge()
    return this
  }

  private data(): Record<string, any> {
    const out: Record<string, any> = {}
    for (const prop in this) {
      if (prop === 'cookie' || prop === 'store') {
        continue
      }
      out[prop] = this[prop]
    }
    return out
  }

  save(cb?: (err?: any) => void): this {
    this.store.set(
      this.id,
      this.data(),
      cb ||
        function () {
          return
        }
    )
    return this
  }

  reload(cb?: (err?: any) => void): this {
    this.store.get(this.id, (err, sess) => {
      if (err) return cb && cb(err)
      if (!sess) return cb && cb(new Error('failed to load session'))
      this.store.createSession(this.req, sess)
      cb && cb(null)
    })
    return this
  }

  destroy(cb?: (err?: any) => void): this {
    this.store.destroy(this.id, cb)
    return this
  }

  regenerate(cb: (err?: any) => void): this {
    this.store.regenerate(this.req, cb)
    return this
  }
}

export abstract class Store extends EventEmitter {
  constructor() {
    super()
  }

  public abstract destroy(id: string, cb?: (err?: any) => void): void
  public abstract get(id: string, cb: (err?: any, session?: any) => void): void
  public abstract set(id: string, session: any, cb?: (err?: any) => void): void
  public abstract touch(id: string, session: any, cb?: (err?: any) => void): void

  generate?: (req: ReqAndSessionInfo) => void

  regenerate(req: any, cb?: (err?: any) => void) {
    const id = req.sessionID
    this.destroy(id, (err) => {
      this.generate && this.generate(req)
      cb && cb(err)
    })
  }

  load(id: string, cb: (err: any, session?: Express.SessionData | null) => any) {
    this.get(id, (err, session) => {
      if (err) return cb(err)
      if (!session) return cb(null)
      const req = {
        sessionID: id,
        sessionStore: this,
      }

      cb(null, this.createSession(req, session))
    })
  }

  createSession(req: any, session: any) {
    const expires = session.cookie && session.cookie.expires
    const originalMaxAge = session.cookie && session.cookie.originalMaxAge

    session.cookie = new Cookie(session.cookie)

    if (typeof expires == 'string') session.cookie.expires = new Date(expires)

    session.cookie.originalMaxAge = originalMaxAge

    req.session = new Session(
      {
        sessionStore: this,
        sessionID: session.id,
      },
      session
    )

    return req.session
  }
}

export type SessionOptions = Partial<{
  /**
   * Function to call to generate a new session ID. Provide a function that returns a string that will be used as a session ID.
   * he function is given `req` as the first argument if you want to use some value attached to `req` when generating the ID.
   */
  genid: (req: ReqAndSessionInfo) => string
  /**
   * The name of the session ID cookie to set in the response (and read from in the request).
   * The default value is `'connect.sid'`.
   */
  name: string
  key: string
  store: Store
  /**
   * Forces the session to be saved back to the session store, even if the session was never modified during the request.
   * Depending on your store this may be necessary, but it can also create race conditions where a client makes two parallel requests to your server and changes made to the session in one request may get overwritten when the other request ends, even if it made no changes (this behavior also depends on what store you're using).
   */
  resave: boolean
  /**
   * Force the session identifier cookie to be set on every response. The expiration is reset to the original maxAge, resetting the expiration countdown.
   * The default value is `false`.
   */
  rolling: boolean
  /**
   * Forces a session that is "uninitialized" to be saved to the store.
   * A session is uninitialized when it is new but not modified.
   * Choosing `false` is useful for implementing login sessions, reducing server storage usage, or complying with laws that require permission before setting a cookie.
   */
  saveUninitialized: boolean
  /**
   * Control the result of unsetting `req.session` (through `delete`, setting to `null`, etc.).
   * The default value is `'keep'`.
   */
  unset: string
  /**
   * Settings object for the session ID cookie.
   */
  cookie: Express.SessionCookieData
}> & {
  secret: string | string[]
}

/**
 * Creates a `getSession` async function to get session data from `req` and `res` and save them to `store`.
 * Only `secret` option is required, all of the rest are optional.
 * Inherits all options from `SessionOptions`
 */
export function SessionManager(options?: SessionOptions): (req: IncomingMessage, res: ServerResponse) => Promise<Session> {
  const opts: SessionOptions = options || ({} as SessionOptions)

  const generateId = opts.genid || generateSessionId

  const name = opts.name || opts.key || 'micro.sid'

  const store = opts.store || new MemoryStore()

  let resaveSession = opts.resave

  if (resaveSession === undefined) resaveSession = true

  const rolling = opts.rolling

  const cookieOptions = opts.cookie

  let saveUninitialized = opts.saveUninitialized

  if (saveUninitialized === undefined) saveUninitialized = true

  if (opts.unset && opts.unset !== 'destroy' && opts.unset !== 'keep') throw new TypeError('unset option must be either destroy or keep')

  let secret: string[]
  if (typeof opts.secret === 'string') {
    secret = [opts.secret]
  } else secret = opts.secret

  if (!secret) throw new TypeError('session requires options.secret')

  if (process.env.NODE_ENV === 'production' && opts.store instanceof MemoryStore) console.warn('MemoryStore should not be used in production')

  let storeReady = true

  store.on('disconnect', () => (storeReady = false))
  store.on('connect', () => (storeReady = false))

  store.generate = (req: ReqAndSessionInfo) => {
    req.sessionID = generateId(req)
    req.sessionStore = store
    req.session = new Session(req, {})
    req.session.cookie = new Cookie(cookieOptions)
  }

  const storeImplementsTouch = typeof store.touch === 'function'

  return (req: IncomingMessage, res: ServerResponse): Promise<Session> => {
    return new Promise((resolve, reject) => {
      if (!storeReady) {
        resolve()
        return
      }

      // pathname mismatch
      const originalPath = url.parse(req.url as string).pathname || '/'
      if (cookieOptions && originalPath.indexOf(cookieOptions.path || '/') !== 0) return

      let cookieId = getcookie(req, name, secret)

      let originalId: string
      let originalHash: string
      let savedHash: string
      let session: Session | undefined = undefined
      let touched = false

      function isModified(session: Session) {
        return originalId !== session.id || originalHash !== hash(session)
      }

      // check if session has been saved
      function isSaved(sess: Session) {
        return originalId === sess.id && savedHash === hash(session)
      }

      function shouldsetCookie(sessionID?: string | boolean | undefined, session?: Session) {
        // cannot set cookie without a session ID
        if (typeof sessionID !== 'string' || !session) return false

        return cookieId !== sessionID ? saveUninitialized || isModified(session) : rolling || (session.cookie.expires != null && isModified(session))
      }

      // determine if session should be saved to store
      function shouldSave(id?: string, session?: Session) {
        // cannot set cookie without a session ID
        if (typeof id !== 'string' || !session) return false

        return !saveUninitialized && cookieId !== id ? isModified(session) : !isSaved(session)
      }

      // determine if session should be touched
      function shouldTouch(id?: string, session?: Session) {
        // cannot set cookie without a session ID
        if (typeof id !== 'string') {
          return false
        }

        return cookieId === id && !shouldSave(id, session)
      }

      // TODO: Get rid of onHeaders dep
      onHeaders(res, () => {
        if (session === undefined) return

        if (!shouldsetCookie(cookieId, session)) return

        if (!touched) {
          session.touch()
          touched = true
        }
        setCookie(res, name, cookieId as string, secret[0], session.cookie.data)
      })

      const _end = res.end
      const _write = res.write
      let ended = false

      res.end = (chunk?: any, encoding?: any) => {
        if (ended) return false

        ended = true

        let ret: any
        let sync = true

        function writeEnd() {
          if (sync) {
            ret = _end.call(res, chunk, encoding)
            sync = false
            return
          }

          _end.call(res, null, '')
        }

        function writetop() {
          if (!sync) return ret

          if (chunk == null) {
            ret = true
            return ret
          }

          const contentLength = Number(res.getHeader('Content-Length'))

          if (!isNaN(contentLength) && contentLength > 0) {
            // measure chunk
            chunk = !Buffer.isBuffer(chunk) ? Buffer.from(chunk, encoding) : chunk
            encoding = undefined

            if (chunk.length !== 0) {
              ret = _write.call(res, chunk.slice(0, chunk.length - 1), encoding)
              chunk = chunk.slice(chunk.length - 1, chunk.length)
              return ret
            }
          }

          ret = _write.call(res, chunk, encoding)
          sync = false

          return ret
        }

        // no session to save
        if (!session) return _end.call(res, chunk, encoding)

        if (!touched) {
          // touch session
          session.touch()
          touched = true
        }

        if (shouldSave(cookieId as string, session)) {
          session.save((err) => {
            if (err) {
              setImmediate(reject, err)
              return
            }

            writeEnd()
          })

          return writetop()
        } else if (storeImplementsTouch && shouldTouch(cookieId as string, session)) {
          // store implements touch method
          store.touch(cookieId as string, session, (err) => {
            if (err) setImmediate(reject, err)

            writeEnd()
          })

          return writetop()
        }

        return _end.call(res, chunk, encoding)
      }

      // generate the session
      function generate() {
        const fakeReq: any = req
        fakeReq.sessionID = cookieId
        fakeReq.session = session
        store.generate && store.generate(fakeReq)
        originalId = fakeReq.sessionID
        originalHash = hash(fakeReq.session)
        session = fakeReq.session
        cookieId = fakeReq.sessionID
        wrapmethods(session as Session)
      }

      // inflate the session
      function inflate(req: any, sess: Session) {
        store.createSession(req as any, sess)
        originalId = req.sessionID
        originalHash = hash(sess)

        if (!resaveSession) savedHash = originalHash

        wrapmethods(req.session)

        session = req.session
      }

      // wrap session methods
      function wrapmethods(sess: Session) {
        const _reload = sess.reload
        const _save = sess.save

        function reload(this: Session, callback: (args?: any) => void, ...args: any[]) {
          _reload.call(this, function () {
            wrapmethods(session as Session)
            callback(args)
          })
        }

        function save(this: Session, cb?: (err?: any) => void) {
          savedHash = hash(this)
          _save.apply(this, [cb])
        }

        Object.defineProperty(sess, 'reload', {
          configurable: true,
          enumerable: false,
          value: reload,
          writable: true,
        })

        Object.defineProperty(sess, 'save', {
          configurable: true,
          enumerable: false,
          value: save,
          writable: true,
        })
      }

      // generate a session if the browser doesn't send a sessionID
      if (!cookieId) {
        generate()
        resolve(session)
        return
      }

      // generate the session object
      store.get(cookieId as string, (err, sess: Session) => {
        // error handling
        if (err && err.code !== 'ENOENT') {
          reject(err)
          return
        }

        try {
          if (err || !sess) generate()
          else inflate(req, sess)
        } catch (e) {
          reject(e)
          return
        }

        resolve(session)
      })
    })
  }
}

function unsignCookie(val: string, secrets: string[]) {
  for (const secret of secrets) {
    const result = signature.unsign(val, secret)

    if (result !== false) return result
  }

  return false
}

function setCookie(res: ServerResponse, name: string, val: string, secret: string, options: SerializeOptions) {
  const signed = 's:' + signature.sign(val, secret)
  const data = cookie.serialize(name, signed, options)

  const prev = (res.getHeader('Set-Cookie') as string[]) || []
  const header = Array.isArray(prev) ? prev.concat(data) : [prev, data]

  res.setHeader('Set-Cookie', header)
}

function getcookie(req: IncomingMessage, name: string, secrets: string[]) {
  const header = req.headers.cookie
  let raw: string
  let val: string | boolean

  // read from cookie header
  if (header) {
    const cookies = cookie.parse(header)

    raw = cookies[name]

    if (raw) {
      if (raw.substr(0, 2) === 's:') {
        val = unsignCookie(raw.slice(2), secrets)

        if (val === false) val = undefined
      }
    }
  }

  return val
}

/**
 * Store in memory. Don't use it in production!
 */
export class MemoryStore extends Store implements ExpressStore {
  private sessions: { [id: string]: string } = {}

  constructor() {
    super()
  }

  all(cb: (err?: any, sessions?: Record<string, any>) => void) {
    const sessionIds = Object.keys(this.sessions)
    const sessions: Record<string, any> = {}

    for (const id of sessionIds) {
      const session = this.getSession(id)
      if (session) sessions[id] = session
    }

    cb && setImmediate(() => cb(null, sessions))
  }

  /**
   * Clear all sessions
   * @param cb Callback
   */
  clear(cb?: (err?: any) => void) {
    this.sessions = {}
    cb && setImmediate(() => cb(null))
  }

  /**
   * Destroy the session associated with the given session ID.
   * @param id Session ID
   * @param cb Callback
   */
  destroy(id: string, cb?: (err?: any) => void) {
    delete this.sessions[id]
    cb && setImmediate(() => cb(null))
  }

  /**
   * Fetch session by the given session ID.
   * @param id Session ID
   * @param cb Callback
   */
  get(id: string, cb: (err?: any, session?: any) => void) {
    const session = this.getSession(id)
    setImmediate(() => cb(null, session))
  }

  /**
   * Commit the given session associated with the given ID to the store.
   * @param id Session ID
   * @param session Session object
   * @param cb Callback
   */
  set(id: string, session: unknown, cb?: (err?: any) => void) {
    this.sessions[id] = JSON.stringify(session)
    cb && setImmediate(() => cb(null))
  }

  /**
   * Get number of active sessions.
   * @param cb Callback
   */
  length(cb: (err?: any, length?: number) => void) {
    this.all((err, sessions) => {
      if (err) return cb(err)
      if (!sessions) return cb(null, 0)
      cb(null, Object.keys(sessions).length)
    })
  }

  /**
   * Touch the given session object associated with the given session ID.
   * @param id Session ID
   * @param session Session Object
   * @param cb Callback
   */
  touch(id: string, session: any, cb?: (err?: any) => void) {
    const currentSession = this.getSession(id)

    if (currentSession) {
      currentSession.cookie = session.cookie
      this.sessions[session] = JSON.stringify(currentSession)
    }

    cb && setImmediate(() => cb(null))
  }

  /**
   * Get session from the store.
   * @param id  Session ID
   */
  private getSession(id: string) {
    const sess = this.sessions[id]

    if (!sess) return

    const sessJSON = JSON.parse(sess)

    if (sessJSON.cookie) {
      let expires: Date
      if (!(sessJSON.cookie.expires instanceof Date)) {
        expires = new Date(sessJSON.cookie.expires)
      } else {
        expires = sessJSON.cookie.expires
      }

      if (expires && expires <= new Date(Date.now())) {
        delete this.sessions[id]
        return
      }
    }

    return sessJSON
  }
}
