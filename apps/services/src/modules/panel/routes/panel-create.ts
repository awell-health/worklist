import { errorSchema } from '@/types.js'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

export const panelCreate = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    schema: {
      description: 'Create a new panel',
      tags: ['panel'],
      body: z.object({
        name: z.string(),
        description: z.string().optional(),
        tenantId: z.string(),
        userId: z.string(),
      }),
      response: {
        201: z.object({
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
        400: errorSchema,
      },
    },
    url: '/panels',
    handler: async (request, reply) => {
      const { name, description, tenantId, userId } = request.body as {
        name: string
        description?: string
        tenantId: string
        userId: string
      }

      const panel = request.store.panel.create({
        name,
        description,
        tenantId,
        userId,
        cohortRule: { conditions: [], logic: 'AND' },
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      await request.store.em.persistAndFlush(panel)
      reply.statusCode = 201
      return {
        id: panel.id,
        name: panel.name,
        description: panel.description ?? null,
        tenantId: panel.tenantId,
        userId: panel.userId,
        cohortRule: panel.cohortRule,
        createdAt: panel.createdAt,
        updatedAt: panel.updatedAt,
      }
    },
  })
}
