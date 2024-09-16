import * as Sentry from '@sentry/node'

Sentry.init({
  dsn: 'https://xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx@o123456.ingest.sentry.io/123456789',
  sampleRate: 1.0,
  tracesSampleRate: 1.0
})
