import jsonwebtoken from 'jsonwebtoken'
import { Response } from '../../packages/app/src'
import { jwt, Request } from '../../packages/jwt/src'

describe('JWT work tests', () => {
  const req = {} as Request
  const res = {} as Response

  it('should work if authorization header is valid jsonwebtoken', () => {
    const secret = 'shhhhhh'
    const token = jsonwebtoken.sign({ foo: 'bar' }, secret)

    req.headers = {}
    req.headers.authorization = 'Bearer ' + token
    jwt({ secret: secret, algorithm: 'HS256' })(req, res, () => {
      expect('bar').toBe(req.user.foo)
    })
  })

  it('should work if authorization header is valid with a buffer secret', () => {
    const secret = Buffer.from('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', 'base64')
    const token = jsonwebtoken.sign({ foo: 'bar' }, secret)

    req.headers = {}
    req.headers.authorization = 'Bearer ' + token
    jwt({ secret: secret.toString(), algorithm: 'HS256' })(req, res, () => {
      expect('bar').toBe(req.user.foo)
    })
  })
})
