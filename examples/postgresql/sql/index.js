import pgq from 'pg-promise'
import { fileURLToPath } from 'url'
import { join, dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

///////////////////////////////////////////////////////////////////////////////////////////////
// Criteria for deciding whether to place a particular query into an external SQL file or to
// keep it in-line (hard-coded):
//
// - Size / complexity of the query, because having it in a separate file will let you develop
//   the query and see the immediate updates without having to restart your application.
//
// - The necessity to document your query, and possibly keeping its multiple versions commented
//   out in the query file.
//
// In fact, the only reason one might want to keep a query in-line within the code is to be able
// to easily see the relation between the query logic and its formatting parameters. However, this
// is very easy to overcome by using only Named Parameters for your query formatting.
////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////
// Helper for linking to external query files;
const sql = (file) => {
  const fullPath = join(__dirname, file) // generating full path;

  const options = {
    // minifying the SQL is always advised;
    // see also option 'compress' in the API;
    minify: true,

    // See also property 'params' for two-step template formatting
  }

  const qf = new pgq.QueryFile(fullPath, options)

  if (qf.error) {
    // Something is wrong with our query file :(
    // Testing all files through queries can be cumbersome,
    // so we also report it here, while loading the module:
    console.error(qf.error)
  }

  return qf

  // See QueryFile API:
  // http://vitaly-t.github.io/pg-promise/QueryFile.html
}

export default {
  users: {
    init: sql('users/init.sql'),
    create: sql('users/create.sql'),
    list: sql('users/list.sql'),
    get: sql('users/get.sql'),
    add: sql('users/add.sql'),
    delete: sql('users/delete.sql'),
    update: sql('users/update.sql'),
  },
}

///////////////////////////////////////////////////////////////////
// Possible alternative - enumerating all SQL files automatically:
// http://vitaly-t.github.io/pg-promise/utils.html#.enumSql
