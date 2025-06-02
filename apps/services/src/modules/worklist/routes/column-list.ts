import { NotFoundError } from '@/errors/not-found-error.js'
import { errorSchema } from '@/types.js'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { ColumnType } from '../entities/worklist-column.entity.js'

const columnSchema = z.object({
  id: z.number(),
  name: z.string(),
  key: z.string(),
  type: z.nativeEnum(ColumnType),
  order: z.number(),
  properties: z.record(z.string(), z.any()),
  metadata: z.record(z.string(), z.any()).optional(),
})

const columnListResponse = z.array(columnSchema)

type ColumnListResponse = z.infer<typeof columnListResponse>

export const columnList = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route<{
    Params: {
      id: string
    }
    Reply: ColumnListResponse
  }>({
    method: 'GET',
    schema: {
      description: 'List all the columns for a worklist',
      tags: ['worklist'],
      params: z.object({
        id: z.string(),
      }),
      response: {
        200: columnListResponse,
        404: errorSchema,
        400: errorSchema,
      },
    },
    url: '/worklists/:id/columns',
    handler: async (request, reply) => {
      const { id } = request.params as { id: string }
      const worklist = await request.store.worklist.findOne(
        {
          id: Number(id),
          tenantId: '',
        },
        { populate: ['columns'] },
      )

      if (!worklist) {
        throw new NotFoundError('Worklist not found')
      }

      reply.statusCode = 200
      return worklist.columns.map((column) => ({
        id: column.id,
        key: column.key,
        name: column.name,
        type: column.type,
        order: column.order,
        properties: column.properties,
        metadata: column.metadata,
      }))
    },
  })
}
