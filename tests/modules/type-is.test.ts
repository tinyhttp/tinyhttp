import { describe, expect, it } from 'vitest'
import { typeIs } from '../../packages/type-is/src'

describe('typeIs', () => {
  it('should return false when value is falsy', () => {
    expect(typeIs('')).toBe(false)
    expect(typeIs(null)).toBe(false)
    expect(typeIs(undefined)).toBe(false)
  })

  it('should return value if types are empty', () => {
    expect(typeIs('application/json')).toBe('application/json')
  })

  it("shouldn't depend on case", () => {
    expect(typeIs('Application/Json')).toBe('application/json')
  })

  it('should return value if types are empty', () => {
    expect(typeIs('application/json', ...['application/json'])).toBe('application/json')
  })

  it('should return value if matched type starts with plus', () => {
    expect(typeIs('application/ld+json', '+json')).toBe('application/ld+json')
  })

  it('should return false if there is no match', () => {
    expect(typeIs('application/ld+json', 'application/javascript')).toBe(false)
  })

  it('should return false if there is no match', () => {
    expect(typeIs('text/html', 'application/javascript')).toBe(false)
  })

  it('should return matched value for urlencoded shorthand', () => {
    expect(typeIs('application/x-www-form-urlencoded', 'urlencoded')).toBe('urlencoded')
  })

  it('should return matched value for urlencoded shorthand', () => {
    expect(typeIs('multipart/form-data', 'multipart')).toBe('multipart')
  })

  it('should return false if types are not strings', () => {
    expect(typeIs('multipart/form-data', false as any)).toBe(false)
    expect(typeIs('multipart/form-data', null)).toBe(false)
    expect(typeIs('multipart/form-data', undefined)).toBe(false)
  })

  it('should return false if expected type has wrong format', () => {
    expect(typeIs('multipart/form-data', 'application/javascript/wrong')).toBe(false)
  })
  it('should return false if the input is not a string', () => {
    const value: Record<number, string> = { 1: 'test' }
    expect(typeIs(value as unknown as string)).toBe(false)
  })
  it('should return the same type as input if the type is not normalized', () => {
    expect(typeIs('text/html', 'file.html')).toBe('file.html')
  })
})