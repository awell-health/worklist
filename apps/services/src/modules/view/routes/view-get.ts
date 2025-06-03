import { NotFoundError } from '@/errors/not-found-error.js'
import { type ViewConfig, errorSchema, viewConfigSchema } from '@/types.js'
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

// Types
type ParamsType = z.infer<typeof paramsSchema>
type QuerystringType = z.infer<typeof querystringSchema>

export const viewGet = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route<{
    Params: ParamsType
    Querystring: QuerystringType
    Reply: ViewConfig
  }>({
    method: 'GET',
    schema: {
      description: 'Get a specific view by ID',
      tags: ['view'],
      params: paramsSchema,
      querystring: querystringSchema,
      response: {
        200: viewConfigSchema,
        404: errorSchema,
      },
    },
    url: '/views/:id',
    handler: async (request, reply) => {
      const { id } = request.params
      const { tenantId, userId } = request.query

      const view = await request.store.view.findOne(
        {
          id: Number(id),
          $or: [
            { ownerUserId: userId, tenantId }, // User's own view
            { isPublished: true, tenantId }, // Published view in tenant
          ],
        },
        {
          populate: ['panel'],
        },
      )

      if (!view) {
        throw new NotFoundError('View not found')
      }

      reply.statusCode = 200
      return {
        id: view.id,
        name: view.name,
        description: '',
        panelId: view.panel.id,
        userId: view.ownerUserId,
        tenantId: view.tenantId,
        isPublished: view.isPublished,
        publishedBy: '',
        publishedAt: view.publishedAt,
        createdAt: view.createdAt,
        updatedAt: view.updatedAt,
        config: {
          columns: view.visibleColumns,
          groupBy: [],
          layout: 'table',
        },
        metadata: {},
        panel: {
          id: view.panel.id,
          name: view.panel.name,
        },
      }
    },
  })
}
