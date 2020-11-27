export const createReq = (socketAddr: string, headers?: Record<string, any>) => ({
  connection: {
    remoteAddress: socketAddr
  },
  headers: headers || {}
})
