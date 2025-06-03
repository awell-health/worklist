import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

export const panelList = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    schema: {
      description: 'List all panels for a user',
      tags: ['panel'],
      querystring: z.object({
        tenantId: z.string(),
        userId: z.string(),
      }),
      response: {
        200: z.array(
          z.object({
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
        ),
      },
    },
    url: '/panels',
    handler: async (request, reply) => {
      const { tenantId, userId } = request.query as {
        tenantId: string
        userId: string
      }

      const panels = await request.store.panel.find(
        { tenantId, userId },
        { populate: ['dataSources', 'baseColumns', 'calculatedColumns'] },
      )

      return panels.map((panel) => ({
        id: panel.id,
        name: panel.name,
        description: panel.description ?? null,
        tenantId: panel.tenantId,
        userId: panel.userId,
        cohortRule: panel.cohortRule,
        createdAt: panel.createdAt,
        updatedAt: panel.updatedAt,
      }))
    },
  })
}
