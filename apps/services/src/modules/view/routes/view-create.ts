import { NotFoundError } from '@/errors/not-found-error.js'
import { errorSchema } from '@/types.js'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

// Zod Schemas
const bodySchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  panelId: z.number(),
  config: z.object({
    columns: z.array(z.string()),
    groupBy: z.array(z.string()).optional(),
    layout: z.enum(['table', 'card', 'kanban']).optional(),
  }),
  metadata: z.record(z.any()).optional(),
  tenantId: z.string(),
  userId: z.string(),
})

const responseSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().optional(),
  panelId: z.number(),
  userId: z.string(),
  tenantId: z.string(),
  isPublished: z.boolean(),
  config: z.object({
    columns: z.array(z.string()),
    groupBy: z.array(z.string()).optional(),
    layout: z.enum(['table', 'card', 'kanban']).optional(),
  }),
  metadata: z.record(z.any()).optional(),
})

// Types
type BodyType = z.infer<typeof bodySchema>
type ResponseType = z.infer<typeof responseSchema>

export const viewCreate = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route<{
    Body: BodyType
    Reply: ResponseType
  }>({
    method: 'POST',
    schema: {
      description: 'Create a new view for a panel',
      tags: ['view'],
      body: bodySchema,
      response: {
        201: responseSchema,
        404: errorSchema,
        400: errorSchema,
      },
    },
    url: '/views',
    handler: async (request, reply) => {
      // !! TODO: Add description and metadata !!
      const { name, panelId, config, tenantId, userId } = request.body

      // First verify panel exists and user has access
      const panel = await request.store.panel.findOne({
        id: panelId,
        tenantId,
        userId,
      })

      if (!panel) {
        throw new NotFoundError('Panel not found')
      }

      const view = request.store.view.create({
        name,
        // description,
        panel,
        ownerUserId: userId,
        tenantId,
        isPublished: false,
        visibleColumns: config.columns,
        // metadata,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      // await request.store.em.persistAndFlush(view)
      reply.statusCode = 201
      return {
        id: view.id,
        name: view.name,
        description: '',
        panelId: view.panel.id,
        userId: view.ownerUserId,
        tenantId,
        isPublished: false,
        config: {
          columns: view.visibleColumns,
          groupBy: [],
          layout: 'table',
        },
      }
    },
  })
}
