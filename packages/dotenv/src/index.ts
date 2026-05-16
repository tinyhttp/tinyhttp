import { readFileSync } from 'node:fs'
import path from 'node:path'
import type { DotenvConfigOptions, DotenvConfigOutput, DotenvParseOptions, DotenvParseOutput } from './types.js'

const log = (message: string) => console.log(`[dotenv][DEBUG] ${message}`)

// Mirrors motdotla/dotenv parser: one multiline regex, no polynomial backtracking.
// Matches: optional `export`, KEY, `=` or `:`, then a quoted ('/"/`) or unquoted value, optional trailing comment.
const LINE =
  /(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/gm

/**
 * Parses a string or buffer in the .env file format into an object.
 *
 * @param src - contents to be parsed
 * @returns an object with keys and values based on `src`
 */
export function parse(src: string | Buffer, _options?: DotenvParseOptions): DotenvParseOutput {
  const obj: DotenvParseOutput = {}
  // normalize line endings so the `m` flag anchors work consistently
  const lines = src.toString().replace(/\r\n?/gm, '\n')

  let match: RegExpExecArray | null
  // biome-ignore lint/suspicious/noAssignInExpressions: idiomatic regex loop
  while ((match = LINE.exec(lines)) != null) {
    const key = match[1]
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') continue

    let value = (match[2] || '').trim()
    const quote = value[0]

    // strip surrounding matching quotes (`, ', ")
    value = value.replace(/^(['"`])([\s\S]*)\1$/gm, '$2')

    // expand escapes only inside double quotes
    if (quote === '"') value = value.replace(/\\n/g, '\n').replace(/\\r/g, '\r')

    obj[key] = value
  }

  return obj
}

/**
 * Loads `.env` file contents into {@link https://nodejs.org/api/process.html#process_process_env | `process.env`}.
 * Example: 'KEY=value' becomes { parsed: { KEY: 'value' } }
 *
 * @param options - controls behavior
 * @returns an object with a `parsed` key if successful or `error` key if an error occurred
 */
export function config(options?: Partial<DotenvConfigOptions>): DotenvConfigOutput {
  const dotenvPath = options?.path || path.resolve(process.cwd(), '.env')
  const encoding = options?.encoding || 'utf8'
  const debug = options?.debug || false
  const override = options?.override || false
  const processEnv = options?.processEnv || process.env

  try {
    const parsed = parse(readFileSync(dotenvPath, { encoding }))

    for (const key of Object.keys(parsed)) {
      if (Object.hasOwn(processEnv, key)) {
        if (override) processEnv[key] = parsed[key]
        if (debug) log(`"${key}" is already defined in \`process.env\` and ${override ? 'WAS' : 'was NOT'} overwritten`)
      } else {
        processEnv[key] = parsed[key]
      }
    }

    return { parsed }
  } catch (error) {
    if (debug) log(`failed to load ${dotenvPath}: ${(error as Error).message}`)
    return { error: error as Error }
  }
}
