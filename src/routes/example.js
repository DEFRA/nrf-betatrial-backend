import Boom from '@hapi/boom'
import { publishToQueue } from "../plugins/publisher.js";

const example = [
  {
    method: 'GET',
    path: '/example',
    handler: async (request, h) => {
      const entities = await findAllExampleData(request.db)
      const result = await publishToQueue('Hello 123')

      return h.response({ message: 'success', entities, result })
    }
  },
  {
    method: 'GET',
    path: '/example/{exampleId}',
    handler: async (request, h) => {
      const entity = await findExampleData(request.db, request.params.exampleId)

      if (!entity) {
        return Boom.notFound()
      }

      return h.response({ message: 'success', entity })
    }
  }
]

export { example }
