import fp from 'fastify-plugin'
import { columnCreateBase } from './routes/column-create-base.js'
import { columnCreateCalculated } from './routes/column-create-calculated.js'
import { columnDelete } from './routes/column-delete.js'
import { columnList } from './routes/column-list.js'
import { columnUpdate } from './routes/column-update.js'

// Export all entities
export * from '../column/entities/base-column.entity.js'
export * from '../column/entities/calculated-column.entity.js'

export default fp(
  async (fastify) => {
    fastify.register(columnCreateBase)
    fastify.register(columnCreateCalculated)
    fastify.register(columnDelete)
    fastify.register(columnList)
    fastify.register(columnUpdate)
  },
  {
    name: 'column',
    dependencies: ['model'],
  },
)
