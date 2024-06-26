import { Client } from '@elastic/elasticsearch'
import { config } from '@tinyhttp/dotenv'
config()

//define elastic client and read keys from the environment
const client = new Client({
  node: process.env.ELASTICSEARCH_NODE,
  auth: {
    username: process.env.ELASTICSEARCH_USER,
    password: process.env.ELASTICSEARCH_PASSWORD
  },
  tls: {
    rejectUnauthorized: false //for development only. Use SSL for production!
  }
})

// search function
export async function search(index, query, value) {
  const result = await client.search({
    index,
    query: {
      match: {
        [query]: value
      }
    }
  })
  return result.hits.hits
}

// index a single document
export async function insert(index, document) {
  await client.index({
    index,
    document,
    refresh: true
  })
  return { success: true }
}

// bulk index multiple documents
export async function bulkInsert(index, document_array) {
  const operations = document_array.flatMap((document) => [{ index: { _index: index } }, document])
  await client.bulk({
    index,
    operations
  })
  return { success: true }
}
