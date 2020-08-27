import fs from 'fs'
import path from 'path'
import * as dotenv from '../../packages/dotenv/src'

const parsed = dotenv.parse(fs.readFileSync(path.join(__dirname, '../fixtures/.env'), { encoding: 'utf8' }))

describe('Dotenv parsing', () => {
  it('sets basic environment variable', () => {
    expect(parsed.BASIC).toBe('basic')
  })
  it('reads after a skipped line', () => {
    expect(parsed.AFTER_LINE).toBe('after_line')
  })
  it('defaults empty values to empty string', () => {
    expect(parsed.EMPTY).toBe('')
  })
  it('escapes single quoted values', () => {
    expect(parsed.SINGLE_QUOTES).toBe('single_quotes')
  })
  it('respects surrounding spaces in single quotes', () => {
    expect(parsed.SINGLE_QUOTES_SPACED).toBe('    single quotes    ')
  })
  it('escapes double quoted values', () => {
    expect(parsed.DOUBLE_QUOTES).toBe('double_quotes')
  })
  it('respects surrounding spaces in double quotes', () => {
    expect(parsed.DOUBLE_QUOTES_SPACED).toBe('    double quotes    ')
  })
  it('expands newlines but only if double quoted', () => {
    expect(parsed.EXPAND_NEWLINES).toBe('expand\nnew\nlines')
  })
  it('expands newlines but only if double quoted', () => {
    expect(parsed.DONT_EXPAND_UNQUOTED).toBe('dontexpand\\nnewlines')
  })
})
