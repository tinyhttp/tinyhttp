import jsonwebtoken from 'jsonwebtoken'
import { Response } from '../../packages/app/src'
import { jwt, Request } from '../../packages/jwt/src'
import fs from 'fs'

describe('JsonWebToken tests', () => {
  const req = {} as Request
  const res = {} as Response

  beforeEach(() => {
    req.headers = {}
    req.user = {}
  })

  it('should work if authorization header is valid jsonwebtoken', () => {
    const secret = 'shhhhhh'
    const token = jsonwebtoken.sign({ foo: 'bar' }, secret)

    req.headers.authorization = 'Bearer ' + token

    jwt({ secret: secret, algorithm: 'HS256' })(req, res, () => {
      expect('bar').toBe(req.user.foo)
    })
  })

  it('should work if authorization header is valid with a buffer secret', () => {
    const secret = Buffer.from('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', 'base64')
    const token = jsonwebtoken.sign({ foo: 'bar' }, secret)

    req.headers.authorization = 'Bearer ' + token

    jwt({ secret: secret.toString(), algorithm: 'HS256' })(req, res, () => {
      expect('bar').toBe(req.user.foo)
    })
  })

  it('should handle private key encryption', () => {
    const privateKey = fs.readFileSync('__tests__/fixtures/jwt/private', { encoding: 'utf-8' })
    const publicKey = fs.readFileSync('__tests__/fixtures/jwt/public', { encoding: 'utf-8' })

    req.headers.authorization = 'Bearer ' + jsonwebtoken.sign({ foo: 'bar' }, privateKey, { algorithm: 'RS256' })

    jwt({ secret: [privateKey, publicKey], algorithm: 'RS256' })(req, res, () => {
      expect('bar').toBe(req.user.foo)
    })
  })

  it('should not work with malformed input', () => {
    const fake_secret = 'notmuchsecret'
    const true_secret = 'verysecret'
    const token = jsonwebtoken.sign({ foo: 'bar' }, fake_secret)

    req.headers.authorization = 'Bearer ' + token

    jwt({ secret: true_secret, algorithm: 'HS256' })(req, res, () => {
      expect(req.user.foo).toBeUndefined()
    })
  })
})
