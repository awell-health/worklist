import { NotFoundError } from '@/errors/not-found-error.js'
import { errorSchema } from '@/types.js'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { Worklist } from '../entities/worklist.entity.js'

const deleteResponse = z.object({
  success: z.boolean(),
})

type DeleteResponse = z.infer<typeof deleteResponse>

export const deleteWorklist = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route<{
    Params: {
      id: string
    }
    Reply: DeleteResponse
  }>({
    method: 'DELETE',
    url: '/worklists/:id',
    schema: {
      description: 'Delete a worklist by id',
      tags: ['worklist'],
      params: z.object({
        id: z.string(),
      }),
      response: {
        200: deleteResponse,
        404: errorSchema,
        400: errorSchema,
      },
    },
    handler: async (request, reply) => {
      const { id } = request.params as { id: string }
      const worklist = await request.store.em.findOne(Worklist, {
        id: Number(id),
      })
      if (!worklist) {
        throw new NotFoundError('Worklist not found')
      }
      await request.store.em.removeAndFlush(worklist)

      reply.statusCode = 200
      return { success: true }
    },
  })
}
