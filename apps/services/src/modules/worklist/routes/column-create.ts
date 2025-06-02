import { NotFoundError } from '@/errors/not-found-error.js'
import { errorSchema } from '@/types.js'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import {
  ColumnType,
  WorklistColumn,
} from '../entities/worklist-column.entity.js'

const columnCreateResponse = z.object({
  id: z.number(),
  name: z.string(),
  key: z.string(),
  type: z.nativeEnum(ColumnType),
  order: z.number(),
  properties: z.record(z.string(), z.any()),
  metadata: z.record(z.string(), z.any()).optional(),
})
const columnCreateSchema = z.object({
  name: z.string(),
  key: z.string(),
  type: z.nativeEnum(ColumnType),
  order: z.number(),
  properties: z.record(z.string(), z.any()),
  metadata: z.record(z.string(), z.any()).optional(),
})

type ColumnCreateSchema = z.infer<typeof columnCreateSchema>
type ColumnCreateResponse = z.infer<typeof columnCreateResponse>

export const columnCreate = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route<{
    Params: {
      id: string
    }
    Body: ColumnCreateSchema
    Reply: ColumnCreateResponse
  }>({
    method: 'POST',
    schema: {
      description: 'Create a column in a worklist',
      tags: ['worklist'],
      params: z.object({
        id: z.string(),
      }),
      body: columnCreateSchema,
      response: {
        200: columnCreateResponse,
        404: errorSchema,
        400: errorSchema,
      },
    },
    url: '/worklists/:id/columns',
    handler: async (request, reply) => {
      const { id } = request.params as { id: string }
      const worklist = await request.store.worklist.findOne({
        id: Number(id),
        tenantId: '',
      })

      if (!worklist) {
        throw new NotFoundError('Worklist not found')
      }

      const columnData = request.body
      const column = request.store.em.create(WorklistColumn, {
        ...columnData,
        worklist,
      })

      await request.store.em.persistAndFlush(column)
      reply.statusCode = 201
      return column
    },
  })
}
