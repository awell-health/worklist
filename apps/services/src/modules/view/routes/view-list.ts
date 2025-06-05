import type { FilterQuery } from '@mikro-orm/core'
import { ErrorSchema } from '@panels/types'
import { type ViewsResponse, ViewsResponseSchema } from '@panels/types/views'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import type { View } from '../entities/view.entity.js'

// Zod Schemas
const querystringSchema = z.object({
  tenantId: z.string(),
  userId: z.string(),
  panelId: z.string().optional(),
  published: z.boolean().optional(),
})

// Types
type QuerystringType = z.infer<typeof querystringSchema>

export const viewList = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route<{
    Querystring: QuerystringType
    Reply: ViewsResponse
  }>({
    method: 'GET',
    schema: {
      description: 'List views for user/tenant with optional filtering',
      tags: ['view'],
      querystring: querystringSchema,
      response: {
        200: ViewsResponseSchema,
        404: ErrorSchema,
        400: ErrorSchema,
      },
    },
    url: '/views',
    handler: async (request, reply) => {
      const { tenantId, userId, panelId, published } = request.query

      const where: FilterQuery<View> = {
        $or: [
          { ownerUserId: userId, tenantId }, // User's own views
          { isPublished: true, tenantId }, // Published views in tenant
        ],
      }

      if (panelId) {
        where.panel = { id: Number(panelId) }
      }
      if (published !== undefined) {
        where.isPublished = published
      }

      const views = await request.store.view.find(where, {
        populate: ['panel'],
        orderBy: { updatedAt: 'DESC' },
      })

      return {
        views: views.map((view) => ({
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
        })),
        total: views.length,
      }
    },
  })
}
