import fp from 'fastify-plugin'
import { panelCreate } from './routes/panel-create.js'
import { panelDelete } from './routes/panel-delete.js'
import { panelGet } from './routes/panel-get.js'
import { panelList } from './routes/panel-list.js'
import { panelUpdate } from './routes/panel-update.js'

// Export all entities
export * from '../panel/entities/panel.entity.js'
export * from './entities/cohort-rule.js'

export default fp(
  async (fastify) => {
    fastify.register(panelCreate)
    fastify.register(panelGet)
    fastify.register(panelList)
    fastify.register(panelUpdate)
    fastify.register(panelDelete)
  },
  {
    name: 'panel',
    dependencies: ['model'],
  },
)
