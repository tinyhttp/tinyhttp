/* c8 ignore start */
export interface DotenvParseOptions {
  /**
   * @deprecated Kept for backwards-compatibility. The new parser does not log per-line warnings.
   */
  debug?: boolean
}

export interface DotenvParseOutput {
  [name: string]: string
}

export type DotenvConfigOptions = {
  /**
   * You may specify a custom path if your file containing environment variables is located elsewhere.
   */
  path: string

  /**
   * You may specify the encoding of your file containing environment variables.
   */
  encoding: BufferEncoding

  /**
   * You may turn on logging to help debug why certain keys or values are not being set as you expect.
   */
  debug: boolean

  /**
   * Override any environment variables that have already been set.
   * @default false
   */
  override: boolean

  /**
   * Specify an object to write your secrets to. Defaults to `process.env`.
   * @default process.env
   */
  processEnv: NodeJS.ProcessEnv
}

export interface DotenvConfigOutput {
  error?: Error
  parsed?: DotenvParseOutput
}

export type config = (options?: DotenvConfigOptions) => DotenvConfigOutput
/* c8 ignore stop */
