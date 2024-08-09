import path from 'node:path'
import { defineConfig } from 'vitest/config'

const relative = (relativePath: string) => {
  return path.resolve(import.meta.dirname, relativePath)
}

export default defineConfig({
  test: {
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['lcov'],
      include: ['packages/*/src']
    }
  },
  resolve: {
    alias: {
      '@tinyhttp/accepts': relative('packages/accepts/src'),
      '@tinyhttp/app': relative('packages/app/src'),
      '@tinyhttp/content-disposition': relative('packages/content-disposition/src'),
      '@tinyhttp/cookie': relative('packages/cookie/src'),
      '@tinyhttp/cookie-signature': relative('packages/cookie-signature/src'),
      '@tinyhttp/dotenv': relative('packages/dotenv/src'),
      '@tinyhttp/encode-url': relative('packages/encode-url/src'),
      '@tinyhttp/etag': relative('packages/etag/src'),
      '@tinyhttp/forwarded': relative('packages/forwarded/src'),
      '@tinyhttp/ip-filter': relative('packages/ip-filter/src'),
      '@tinyhttp/jsonp': relative('packages/jsonp/src'),
      '@tinyhttp/proxy-addr': relative('packages/proxy-addr/src'),
      '@tinyhttp/rate-limit': relative('packages/rate-limit/src'),
      '@tinyhttp/req': relative('packages/req/src'),
      '@tinyhttp/res': relative('packages/res/src'),
      '@tinyhttp/router': relative('packages/router/src'),
      '@tinyhttp/send': relative('packages/send/src'),
      '@tinyhttp/type-is': relative('packages/type-is/src'),
      '@tinyhttp/url': relative('packages/url/src')
    }
  }
})
