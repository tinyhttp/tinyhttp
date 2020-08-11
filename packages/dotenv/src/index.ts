import fs from 'fs'
import path from 'path'
import { DotenvParseOptions, DotenvParseOutput, DotenvConfigOptions, DotenvConfigOutput } from './structs'

const log = (message: string) => console.log(`[dotenv][DEBUG] ${message}`)

const NEWLINE = '\n'
const RE_INI_KEY_VAL = /^\s*([\w.-]+)\s*=\s*(.*)?\s*$/
const RE_NEWLINES = /\\n/g
const NEWLINES_MATCH = /\n|\r|\r\n/

/**
 * Parses a string or buffer in the .env file format into an object.
 *
 * @param src - contents to be parsed
 * @param options - additional options
 * @returns an object with keys and values based on `src`
 */
export function parse(src: string | Buffer, options?: DotenvParseOptions): DotenvParseOutput {
  const debug = Boolean(options && options.debug)
  const obj = {}

  // convert Buffers before splitting into lines and processing
  src
    .toString()
    .split(NEWLINES_MATCH)
    .forEach((line: string, idx: number) => {
      // matching "KEY' and 'VAL' in 'KEY=VAL'
      const keyValueArr = line.match(RE_INI_KEY_VAL)
      // matched?
      if (keyValueArr != null) {
        const key = keyValueArr[1]
        // default undefined or missing values to empty string
        let val = keyValueArr[2] || ''
        const end = val.length - 1
        const isDoubleQuoted = val[0] === '"' && val[end] === '"'
        const isSingleQuoted = val[0] === "'" && val[end] === "'"

        // if single or double quoted, remove quotes
        if (isSingleQuoted || isDoubleQuoted) {
          val = val.substring(1, end)

          // if double quoted, expand newlines
          if (isDoubleQuoted) {
            val = val.replace(RE_NEWLINES, NEWLINE)
          }
        } else {
          // remove surrounding whitespace
          val = val.trim()
        }

        obj[key] = val
      } else if (debug) {
        log(`did not match key and value when parsing line ${idx + 1}: ${line}`)
      }
    })

  return obj
}

/**
 * Loads `.env` file contents into {@link https://nodejs.org/api/process.html#process_process_env | `process.env`}.
 * Example: 'KEY=value' becomes { parsed: { KEY: 'value' } }
 *
 * @param options - controls behavior
 * @returns an object with a `parsed` key if successful or `error` key if an error occurred
 *
 */
export function config(options?: Partial<DotenvConfigOptions>): DotenvConfigOutput {
  const dotenvPath = options?.path || path.resolve(process.cwd(), '.env')
  const encoding = options?.encoding || 'utf8'
  const debug = options?.debug || false

  try {
    // specifying an encoding returns a string instead of a buffer
    const parsed = parse(fs.readFileSync(dotenvPath, { encoding }), { debug })

    Object.keys(parsed).forEach((key: string) => {
      if (!Object.prototype.hasOwnProperty.call(process.env, key)) {
        process.env[key] = parsed[key]
      } else if (debug) {
        log(`"${key}" is already defined in \`process.env\` and will not be overwritten`)
      }
    })

    return { parsed }
  } catch (error) {
    return { error }
  }
}
