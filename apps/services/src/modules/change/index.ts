import fp from 'fastify-plugin'
import { panelChanges } from './routes/panel-changes.js'
import { viewNotifications } from './routes/view-notifications.js'

export default fp(
  async (fastify) => {
    fastify.register(panelChanges)
    fastify.register(viewNotifications)
  },
  {
    name: 'change',
    dependencies: ['model'],
  },
)
