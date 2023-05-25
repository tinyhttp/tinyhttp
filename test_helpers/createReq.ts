export const createReq = (
  socketAddr: string,
  headers?: Record<string, string>
): {
  socket: {
    remoteAddress: string
  }
  headers: Record<string, string>
} => ({
  socket: {
    remoteAddress: socketAddr
  },
  headers: headers || {}
})
