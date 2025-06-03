import { NotFoundError } from '@/errors/not-found-error.js'
import { errorSchema } from '@/types.js'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

// Zod Schemas
const paramsSchema = z.object({
  id: z.string(),
  dsId: z.string(),
})

const bodySchema = z.object({
  tenantId: z.string(),
  userId: z.string(),
})

const syncResponseSchema = z.object({
  id: z.number(),
  type: z.enum(['database', 'api', 'file', 'custom']),
  config: z.record(z.any()),
  lastSync: z.date(),
  syncStatus: z.enum(['success', 'error']),
  message: z.string().optional(),
})

// Types
type ParamsType = z.infer<typeof paramsSchema>
type BodyType = z.infer<typeof bodySchema>
type ResponseType = z.infer<typeof syncResponseSchema>

export const datasourceSync = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route<{
    Params: ParamsType
    Body: BodyType
    Reply: ResponseType
  }>({
    method: 'POST',
    schema: {
      description: 'Sync a data source',
      tags: ['panel', 'datasource'],
      params: paramsSchema,
      body: bodySchema,
      response: {
        200: syncResponseSchema,
        404: errorSchema,
        400: errorSchema,
      },
    },
    url: '/panels/:id/datasources/:dsId/sync',
    handler: async (request, reply) => {
      const { id, dsId } = request.params
      const { tenantId, userId } = request.body

      // First verify panel exists and user has access
      const panel = await request.store.panel.findOne({
        id: Number(id),
        tenantId,
        userId,
      })

      if (!panel) {
        throw new NotFoundError('Panel not found')
      }

      // Find the data source
      const dataSource = await request.store.dataSource.findOne({
        id: Number(dsId),
        panel: { id: Number(id) },
      })

      if (!dataSource) {
        throw new NotFoundError('Data source not found')
      }

      // TODO: Implement actual sync logic based on data source type
      // For now, just update lastSync timestamp
      dataSource.lastSync = new Date()

      await request.store.em.flush()

      return {
        ...dataSource,
        syncStatus: 'success' as const,
        message: 'Data source synced successfully',
      }
    },
  })
}
