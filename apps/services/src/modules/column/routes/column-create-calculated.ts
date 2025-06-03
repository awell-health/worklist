import { NotFoundError } from '@/errors/not-found-error.js'
import { errorSchema } from '@/types.js'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

// Zod Schemas
const paramsSchema = z.object({
  id: z.string(),
})

const columnPropertiesSchema = z.object({
  required: z.boolean().optional(),
  unique: z.boolean().optional(),
  defaultValue: z.any().optional(),
  validation: z
    .object({
      min: z.number().optional(),
      max: z.number().optional(),
      pattern: z.string().optional(),
      options: z.array(z.string()).optional(),
    })
    .optional(),
  display: z
    .object({
      width: z.number().optional(),
      format: z.string().optional(),
      visible: z.boolean().optional(),
    })
    .optional(),
})

const bodySchema = z.object({
  name: z.string(),
  type: z.enum([
    'text',
    'number',
    'date',
    'boolean',
    'select',
    'multi_select',
    'user',
    'file',
    'custom',
  ]),
  formula: z.string(),
  dependencies: z.array(z.string()),
  properties: columnPropertiesSchema,
  metadata: z.record(z.any()).optional(),
  tenantId: z.string(),
  userId: z.string(),
})

const responseSchema = z.object({
  id: z.number(),
  name: z.string(),
  type: z.enum([
    'text',
    'number',
    'date',
    'boolean',
    'select',
    'multi_select',
    'user',
    'file',
    'custom',
  ]),
  formula: z.string(),
  dependencies: z.array(z.string()),
  properties: columnPropertiesSchema,
  metadata: z.record(z.any()).optional(),
})

// Types
type ParamsType = z.infer<typeof paramsSchema>
type BodyType = z.infer<typeof bodySchema>
type ResponseType = z.infer<typeof responseSchema>

export const columnCreateCalculated = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route<{
    Params: ParamsType
    Body: BodyType
    Reply: ResponseType
  }>({
    method: 'POST',
    schema: {
      description: 'Create a new calculated column for a panel',
      tags: ['panel', 'column'],
      params: paramsSchema,
      body: bodySchema,
      response: {
        201: responseSchema,
        404: errorSchema,
        400: errorSchema,
      },
    },
    url: '/panels/:id/columns/calculated',
    handler: async (request, reply) => {
      const { id } = request.params
      const {
        name,
        type,
        formula,
        dependencies,
        properties,
        metadata,
        tenantId,
        userId,
      } = request.body

      // First verify panel exists and user has access
      const panel = await request.store.panel.findOne({
        id: Number(id),
        tenantId,
        userId,
      })

      if (!panel) {
        throw new NotFoundError('Panel not found')
      }

      // TODO: Validate formula and dependencies exist in panel

      const calculatedColumn = request.store.calculatedColumn.create({
        name,
        type,
        formula,
        dependencies,
        properties,
        metadata,
        panel,
      })

      await request.store.em.persistAndFlush(calculatedColumn)
      reply.statusCode = 201
      return calculatedColumn
    },
  })
}
