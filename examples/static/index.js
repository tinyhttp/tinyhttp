import { App } from '@tinyhttp/app'

import sirv from 'sirv'

new App().use('/static', (req, res) => sirv('static')(req, res)).listen(3000)
