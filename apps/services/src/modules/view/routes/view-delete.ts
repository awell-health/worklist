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

// Types
type ParamsType = z.infer<typeof paramsSchema>
type QuerystringType = z.infer<typeof querystringSchema>

export const viewDelete = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route<{
    Params: ParamsType
    Querystring: QuerystringType
  }>({
    method: 'DELETE',
    schema: {
      description: 'Delete a view (only owner can delete)',
      tags: ['view'],
      params: paramsSchema,
      querystring: querystringSchema,
      response: {
        204: z.void(),
        404: errorSchema,
        400: errorSchema,
      },
    },
    url: '/views/:id',
    handler: async (request, reply) => {
      const { id } = request.params
      const { tenantId, userId } = request.query

      // Only owner can delete their own view
      const view = await request.store.view.findOne({
        id: Number(id),
        ownerUserId: userId,
        tenantId,
      })

      if (!view) {
        throw new NotFoundError('View not found')
      }

      // If view is published, also delete related notifications
      if (view.isPublished) {
        await request.store.viewNotification.nativeDelete({
          view: { id: Number(id) },
        })
      }

      await request.store.view.nativeDelete(view)
      reply.statusCode = 204
    },
  })
}
