import { errorSchema } from '@/types.js'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { Worklist } from '../entities/worklist.entity.js'

const createSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
})

const createResponse = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().optional(),
})

type CreateSchema = z.infer<typeof createSchema>
type CreateResponse = z.infer<typeof createResponse>

export const create = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route<{
    Body: CreateSchema
    Reply: CreateResponse
  }>({
    method: 'POST',
    schema: {
      description: 'Create a new worklist',
      tags: ['worklist'],
      body: createSchema,
      response: {
        200: createResponse,
        404: errorSchema,
        400: errorSchema,
      },
    },
    url: '/worklists',
    handler: async (request, reply) => {
      const { name, description } = request.body
      const worklist = request.store.em.create(Worklist, {
        name,
        description,
        createdAt: new Date(),
        updatedAt: new Date(),
        tenantId: '',
      })
      await request.store.em.persistAndFlush(worklist)

      reply.statusCode = 201
      return {
        id: worklist.id,
        name: worklist.name,
        description: worklist.description,
      }
    },
  })
}
