import { DotenvConfigOptions } from './structs'

// ../config.js accepts options via environment variables
let options: DotenvConfigOptions

const { DOTENV_CONFIG_ENCODING, DOTENV_CONFIG_PATH, DOTENV_CONFIG_DEBUG } = process.env

options.encoding = DOTENV_CONFIG_ENCODING as BufferEncoding
options.path = DOTENV_CONFIG_PATH
options.debug = !!DOTENV_CONFIG_DEBUG

export default options
