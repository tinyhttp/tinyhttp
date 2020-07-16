import { hsr } from 'sosse'
import server from './server.js'

hsr({
  // Used as a prefix to resolve other configuration paths
  base: process.cwd(),
  // Will be called on file changes
  main: () => server(),
  plugins: [],
})
