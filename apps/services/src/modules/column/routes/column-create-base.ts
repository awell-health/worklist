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
  sourceField: z.string(),
  dataSourceId: z.number(),
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
  sourceField: z.string(),
  properties: columnPropertiesSchema,
  metadata: z.record(z.any()).optional(),
})

// Types
type ParamsType = z.infer<typeof paramsSchema>
type BodyType = z.infer<typeof bodySchema>
type ResponseType = z.infer<typeof responseSchema>

export const columnCreateBase = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route<{
    Params: ParamsType
    Body: BodyType
    Reply: ResponseType
  }>({
    method: 'POST',
    schema: {
      description: 'Create a new base column for a panel',
      tags: ['panel', 'column'],
      params: paramsSchema,
      body: bodySchema,
      response: {
        201: responseSchema,
        404: errorSchema,
        400: errorSchema,
      },
    },
    url: '/panels/:id/columns/base',
    handler: async (request, reply) => {
      const { id } = request.params
      const {
        name,
        type,
        sourceField,
        dataSourceId,
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

      // Verify data source exists and belongs to this panel
      const dataSource = await request.store.dataSource.findOne({
        id: dataSourceId,
        panel: { id: Number(id) },
      })

      if (!dataSource) {
        throw new NotFoundError('Data source not found')
      }

      const baseColumn = request.store.baseColumn.create({
        name,
        type,
        sourceField,
        properties,
        metadata,
        dataSource,
        panel,
      })

      await request.store.em.persistAndFlush(baseColumn)
      reply.statusCode = 201
      return baseColumn
    },
  })
}
