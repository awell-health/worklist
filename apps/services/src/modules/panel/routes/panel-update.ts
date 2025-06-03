import { NotFoundError } from '@/errors/not-found-error.js'
import { errorSchema } from '@/types.js'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

export const panelUpdate = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route<{
    Params: {
      id: string
    }
  }>({
    method: 'PUT',
    schema: {
      description: 'Update a panel',
      tags: ['panel'],
      params: z.object({
        id: z.string(),
      }),
      body: z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        tenantId: z.string(),
        userId: z.string(),
      }),
      response: {
        200: z.object({
          id: z.number(),
          name: z.string(),
          description: z.string().nullable(),
          tenantId: z.string(),
          userId: z.string(),
          cohortRule: z.object({
            conditions: z.array(z.any()),
            logic: z.enum(['AND', 'OR']),
          }),
          createdAt: z.date(),
          updatedAt: z.date(),
        }),
        404: errorSchema,
      },
    },
    url: '/panels/:id',
    handler: async (request, reply) => {
      const { id } = request.params as { id: string }
      const { name, description, tenantId, userId } = request.body as {
        name?: string
        description?: string
        tenantId: string
        userId: string
      }

      const panel = await request.store.panel.findOne({
        id: Number(id),
        tenantId,
        userId,
      })

      if (!panel) {
        throw new NotFoundError('Panel not found')
      }

      if (name) panel.name = name
      if (description !== undefined) panel.description = description

      await request.store.em.flush()
      return panel
    },
  })
}
