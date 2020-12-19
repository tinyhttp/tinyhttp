import { App } from '@tinyhttp/app'

import sirv from 'sirv'

new App().use('/files', sirv('static')).listen(3000)
