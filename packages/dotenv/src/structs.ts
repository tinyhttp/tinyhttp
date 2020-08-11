export interface DotenvParseOptions {
  /**
   * You may turn on logging to help debug why certain keys or values are not being set as you expect.
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
}

export interface DotenvConfigOutput {
  error?: Error
  parsed?: DotenvParseOutput
}

export type config = (options?: DotenvConfigOptions) => DotenvConfigOutput
