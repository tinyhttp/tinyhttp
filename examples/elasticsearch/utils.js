import { config } from '@tinyhttp/dotenv'

config()

export const isEmptyObject = (obj) => Object.keys(obj).length === 0 && obj.constructor === Object

export const hasPostProps = (obj) => Object.keys(obj).every((x) => ['title', 'abstract', 'link'].includes(x))

export const isEmptyString = (data) => data.length === 0

export const PORT = Number.parseInt(process.env.PORT || '3000', 10)
