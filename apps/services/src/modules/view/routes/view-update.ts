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
  name: z.string().optional(),
  description: z.string().optional(),
  config: z
    .object({
      columns: z.array(z.string()),
      groupBy: z.array(z.string()).optional(),
      layout: z.enum(['table', 'card', 'kanban']).optional(),
    })
    .optional(),
  //metadata: z.record(z.any()).optional(),
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
  //metadata: z.record(z.any()).optional(),
})

// Types
type ParamsType = z.infer<typeof paramsSchema>
type BodyType = z.infer<typeof bodySchema>
type ResponseType = z.infer<typeof responseSchema>

export const viewUpdate = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route<{
    Params: ParamsType
    Body: BodyType
    Reply: ResponseType
  }>({
    method: 'PUT',
    schema: {
      description: 'Update a view (only owner can update)',
      tags: ['view'],
      params: paramsSchema,
      body: bodySchema,
      response: {
        200: responseSchema,
        404: errorSchema,
        400: errorSchema,
      },
    },
    url: '/views/:id',
    handler: async (request, reply) => {
      const { id } = request.params
      const { name, config, tenantId, userId } = request.body

      // Only owner can update their own view
      const view = await request.store.view.findOne({
        id: Number(id),
        ownerUserId: userId,
        tenantId,
      })

      if (!view) {
        throw new NotFoundError('View not found')
      }

      // Update fields
      if (name) view.name = name
      // !!! description is not used yet !!!
      //if (description !== undefined) view.description = description
      if (config) view.visibleColumns = config.columns
      //if (metadata !== undefined) view.metadata = metadata

      await request.store.em.persistAndFlush(view)
      return {
        id: view.id,
        name: view.name,
        panelId: view.panel.id,
        userId: view.ownerUserId,
        tenantId,
        isPublished: view.isPublished,
        config: {
          columns: view.visibleColumns,
          groupBy: [],
          layout: 'table',
        },
      }
    },
  })
}
