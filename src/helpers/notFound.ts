import { Handler } from '../index'

const notFound = (): Handler => (_, res) => {
  if (!res.writableEnded) {
    res.statusCode = 404
    res.end('Not found')
  }
}

export default notFound
