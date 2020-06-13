import { ServerResponse } from 'http'

export default class Response extends ServerResponse {
  send(msg: any) {
    if (typeof msg === 'object') {
      this.writeHead(200, {
        'Content-Type': 'application/json'
      })
      this.end(JSON.stringify(msg))
    } else {
      this.end(msg)
    }
  }
}
