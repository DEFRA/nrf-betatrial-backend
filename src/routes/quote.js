import Boom from '@hapi/boom'
import { publishToQueue } from '../utils/publisher.js'

const quote = [
  {
    method: 'GET',
    path: '/block',
    handler: async (request, h) => {
      // Example: simulate heavy CPU work for ~60 seconds
      const end = Date.now() + 60_000
      let result = 0

      while (Date.now() < end) {
        result += Math.sqrt(Math.random()) * Math.random()
      }

      return h.response({ message: 'success', result })
    }
  },
  {
    method: 'POST',
    path: '/quote',
    handler: async (request, h) => {
      // const entities = await findAllExampleData(request.db)
      const entities = {}
      const result = await publishToQueue({ message: 'Hello 123' })

      return h.response({ message: 'success', entities, result })
    }
  },
  {
    method: 'GET',
    path: '/quote/{id}',
    handler: async (request, h) => {
      // const entity = await findExampleData(request.db, request.params.exampleId)
      const entity = {}

      if (!entity) {
        return Boom.notFound()
      }

      return h.response({ message: 'success', entity })
    }
  }
]

export { quote }
