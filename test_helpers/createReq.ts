export const createReq = (
  socketAddr: string,
  headers?: Record<string, string>
): {
  connection: {
    remoteAddress: string
  }
  headers: Record<string, string>
} => ({
  connection: {
    remoteAddress: socketAddr
  },
  headers: headers || {}
})
