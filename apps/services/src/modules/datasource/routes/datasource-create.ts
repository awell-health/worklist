import { NotFoundError } from '@/errors/not-found-error.js'
import { errorSchema } from '@/types.js'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

// Zod Schemas
const paramsSchema = z.object({
  id: z.string(),
})

const bodySchema = z.object({
  type: z.enum(['database', 'api', 'file', 'custom']),
  config: z.record(z.any()),
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

export const datasourceCreate = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route<{
    Params: ParamsType
    Body: BodyType
    Reply: ResponseType
  }>({
    method: 'POST',
    schema: {
      description: 'Create a new data source for a panel',
      tags: ['panel', 'datasource'],
      params: paramsSchema,
      body: bodySchema,
      response: {
        201: dataSourceResponseSchema,
        404: errorSchema,
        400: errorSchema,
      },
    },
    url: '/panels/:id/datasources',
    handler: async (request, reply) => {
      const { id } = request.params
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

      const dataSource = request.store.dataSource.create({
        type,
        config,
        lastSync: new Date(),
        panel,
      })

      await request.store.em.persistAndFlush(dataSource)
      reply.statusCode = 201
      return dataSource
    },
  })
}
