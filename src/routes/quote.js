import Boom from '@hapi/boom'
import { publishToQueue } from '../utils/publisher.js'

const quote = [
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
