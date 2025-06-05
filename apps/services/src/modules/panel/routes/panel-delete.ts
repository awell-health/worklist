import { NotFoundError } from '@/errors/not-found-error.js'
import {
  ErrorSchema,
  IdParamSchema,
  type OperationResult,
  OperationResultSchema,
} from '@panels/types'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

export const panelDelete = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route<{
    Params: {
      id: string
    }
    Reply: OperationResult
  }>({
    method: 'DELETE',
    schema: {
      description: 'Delete a panel',
      tags: ['panel'],
      params: IdParamSchema,
      body: z.object({
        tenantId: z.string(),
        userId: z.string(),
      }),
      response: {
        204: OperationResultSchema,
        404: ErrorSchema,
      },
    },
    url: '/panels/:id',
    handler: async (request, reply) => {
      const { id } = request.params as { id: string }
      const { tenantId, userId } = request.body as {
        tenantId: string
        userId: string
      }

      const panel = await request.store.em.findOne('Panel', {
        id: Number(id),
        tenantId,
        userId,
      })

      if (!panel) {
        throw new NotFoundError('Panel not found')
      }

      await request.store.em.removeAndFlush(panel)
      reply.statusCode = 204
      return { success: true }
    },
  })
}
