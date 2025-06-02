import { NotFoundError } from '@/errors/not-found-error.js'
import { errorSchema } from '@/types.js'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

export const columnDelete = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route<{
    Params: {
      id: string
      columnId: string
    }
  }>({
    method: 'DELETE',
    schema: {
      description: 'Delete a column from a worklist',
      tags: ['worklist'],
      params: z.object({
        id: z.string(),
        columnId: z.string(),
      }),
      response: {
        404: errorSchema,
        400: errorSchema,
      },
    },
    url: '/worklists/:id/columns/:columnId',
    handler: async (request, reply) => {
      const { id, columnId } = request.params as {
        id: string
        columnId: string
      }
      const column = await request.store.worklistColumn.findOne({
        id: Number(columnId),
        worklist: { id: Number(id), tenantId: '' },
      })

      if (!column) {
        throw new NotFoundError('Column not found')
      }

      await request.store.em.removeAndFlush(column)
      reply.statusCode = 204
      return { success: true }
    },
  })
}
