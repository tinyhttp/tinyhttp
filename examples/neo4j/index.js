import { App } from '@tinyhttp/app'
import { driver } from 'neo4j-driver'

const neo4jDriver = driver('bolt://localhost:7687')

const app = new App()

app
  .get('/person', async (req, res) => {
    const session = neo4jDriver.session()
    const result = await session.run(
      `
        MATCH path = shortestPath(
          (First:Person {name: $person1 })-[*]-(Second:Person {name: $person2 })
        )
        UNWIND nodes(path) as node
        RETURN coalesce(node.name, node.title) as text;
      `,
      {
        person1: req.query.person1,
        person2: req.query.person2
      }
    )
    res.json({
      path: result.records.map((record) => record.get('text'))
    })
    await session.close()
  })
  .listen(3000, () => console.log('Listening on http://localhost:3000'))
