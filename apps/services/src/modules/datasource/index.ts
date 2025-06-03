import fp from 'fastify-plugin'
import { datasourceCreate } from './routes/datasource-create.js'
import { datasourceDelete } from './routes/datasource-delete.js'
import { datasourceList } from './routes/datasource-list.js'
import { datasourceSync } from './routes/datasource-sync.js'
import { datasourceUpdate } from './routes/datasource-update.js'

// Export all entities
export * from '../datasource/entities/data-source.entity.js'

export default fp(
  async (fastify) => {
    fastify.register(datasourceCreate)
    fastify.register(datasourceList)
    fastify.register(datasourceSync)
    fastify.register(datasourceUpdate)
    fastify.register(datasourceDelete)
  },
  {
    name: 'worklist',
    dependencies: ['model'],
  },
)
