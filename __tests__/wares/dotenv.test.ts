import fs from 'fs'
import path from 'path'
import * as dotenv from '../../packages/dotenv/src'

const envPath = path.join(__dirname, '../fixtures/.env')

const envFile = fs.readFileSync(envPath, { encoding: 'utf8' })

const parsed = dotenv.parse(envFile)

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
  it('should parse a buffer into an object', () => {
    const payload = dotenv.parse(Buffer.from('BUFFER=true'))
    expect(payload.BUFFER).toBe('true')
  })
})

describe('Dotenv config', () => {
  afterEach(() => {
    process.env = {}
  })
  it('takes path as option', () => {
    const parsed = dotenv.config({ path: envPath })

    expect(parsed.parsed.BASIC).toBe('basic')
  })
  it('populates process.env', () => {
    dotenv.config({ path: envPath })

    expect(process.env.BASIC).toBe('basic')
  })
})
