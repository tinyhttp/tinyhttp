import { DotenvConfigOptions } from './types'

// ../config.js accepts options via environment variables
let options: DotenvConfigOptions

const { DOTENV_CONFIG_ENCODING, DOTENV_CONFIG_PATH, DOTENV_CONFIG_DEBUG } = process.env

if (DOTENV_CONFIG_ENCODING != null) options.encoding = DOTENV_CONFIG_ENCODING
if (DOTENV_CONFIG_PATH != null) options.path = DOTENV_CONFIG_PATH
if (DOTENV_CONFIG_DEBUG != null) options.debug = DOTENV_CONFIG_DEBUG

export default options
