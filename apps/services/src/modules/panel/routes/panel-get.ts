import { NotFoundError } from '@/errors/not-found-error.js'
import { errorSchema } from '@/types.js'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

export const panelGet = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route<{
    Params: {
      id: string
    }
    Querystring: {
      tenantId: string
      userId: string
    }
  }>({
    method: 'GET',
    schema: {
      description: 'Get a panel by ID',
      tags: ['panel'],
      params: z.object({
        id: z.string(),
      }),
      querystring: z.object({
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
      const { tenantId, userId } = request.query as {
        tenantId: string
        userId: string
      }

      const panel = await request.store.panel.findOne(
        {
          id: Number(id),
          tenantId,
          userId,
        },
        {
          populate: [
            'dataSources',
            'baseColumns',
            'baseColumns.dataSource',
            'calculatedColumns',
            'views',
          ],
        },
      )

      if (!panel) {
        throw new NotFoundError('Panel not found')
      }

      return panel
    },
  })
}
