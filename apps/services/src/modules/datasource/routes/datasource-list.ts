import { NotFoundError } from '@/errors/not-found-error.js'
import { errorSchema } from '@/types.js'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

// Zod Schemas
const paramsSchema = z.object({
  id: z.string(),
})

const querystringSchema = z.object({
  tenantId: z.string(),
  userId: z.string(),
})

const dataSourceResponseSchema = z.object({
  id: z.number(),
  type: z.enum(['database', 'api', 'file', 'custom']),
  config: z.record(z.any()),
  lastSync: z.date(),
})

const responseSchema = z.array(dataSourceResponseSchema)

// Types
type ParamsType = z.infer<typeof paramsSchema>
type QuerystringType = z.infer<typeof querystringSchema>
type ResponseType = z.infer<typeof responseSchema>

export const datasourceList = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route<{
    Params: ParamsType
    Querystring: QuerystringType
    Reply: ResponseType
  }>({
    method: 'GET',
    schema: {
      description: 'List all data sources for a panel',
      tags: ['panel', 'datasource'],
      params: paramsSchema,
      querystring: querystringSchema,
      response: {
        200: responseSchema,
        404: errorSchema,
      },
    },
    url: '/panels/:id/datasources',
    handler: async (request, reply) => {
      const { id } = request.params
      const { tenantId, userId } = request.query

      // First verify panel exists and user has access
      const panel = await request.store.panel.findOne({
        id: Number(id),
        tenantId,
        userId,
      })

      if (!panel) {
        throw new NotFoundError('Panel not found')
      }

      const dataSources = await request.store.dataSource.find(
        { panel: { id: Number(id) } },
        { populate: ['panel'] },
      )

      return dataSources
    },
  })
}
