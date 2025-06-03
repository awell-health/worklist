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
  type: z.enum(['database', 'api', 'file', 'custom']).optional(),
  config: z.record(z.any()).optional(),
  tenantId: z.string(),
  userId: z.string(),
})

const dataSourceResponseSchema = z.object({
  id: z.number(),
  type: z.enum(['database', 'api', 'file', 'custom']),
  config: z.record(z.any()),
  lastSync: z.date(),
})

// Types
type ParamsType = z.infer<typeof paramsSchema>
type BodyType = z.infer<typeof bodySchema>
type ResponseType = z.infer<typeof dataSourceResponseSchema>

export const datasourceUpdate = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route<{
    Params: ParamsType
    Body: BodyType
    Reply: ResponseType
  }>({
    method: 'PUT',
    schema: {
      description: 'Update a data source',
      tags: ['panel', 'datasource'],
      params: paramsSchema,
      body: bodySchema,
      response: {
        200: dataSourceResponseSchema,
        404: errorSchema,
        400: errorSchema,
      },
    },
    url: '/panels/:id/datasources/:dsId',
    handler: async (request, reply) => {
      const { id, dsId } = request.params
      const { type, config, tenantId, userId } = request.body

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

      // Update fields
      if (type) dataSource.type = type
      if (config) dataSource.config = config

      await request.store.em.flush()
      return dataSource
    },
  })
}
