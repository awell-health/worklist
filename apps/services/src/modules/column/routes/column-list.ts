import { NotFoundError } from '@/errors/not-found-error.js'
import { errorSchema } from '@/types.js'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

// Zod Schemas
const paramsSchema = z.object({
  id: z.string(),
})

const querystringSchema = z.object({
  tenantId: z.string(),
  userId: z.string(),
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

const baseColumnSchema = z.object({
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
  columnType: z.literal('base'),
})

const calculatedColumnSchema = z.object({
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
  columnType: z.literal('calculated'),
})

const responseSchema = z.object({
  baseColumns: z.array(baseColumnSchema),
  calculatedColumns: z.array(calculatedColumnSchema),
})

// Types
type ParamsType = z.infer<typeof paramsSchema>
type QuerystringType = z.infer<typeof querystringSchema>
type ResponseType = z.infer<typeof responseSchema>

export const columnList = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route<{
    Params: ParamsType
    Querystring: QuerystringType
    Reply: ResponseType
  }>({
    method: 'GET',
    schema: {
      description: 'List all columns for a panel',
      tags: ['panel', 'column'],
      params: paramsSchema,
      querystring: querystringSchema,
      response: {
        200: responseSchema,
        404: errorSchema,
      },
    },
    url: '/panels/:id/columns',
    handler: async (request, reply) => {
      const { id } = request.params
      const { tenantId, userId } = request.query

      // First verify panel exists and user has access
      const panel = await request.store.panel.findOne({
        id: Number(id),
        tenantId,
        userId,
      })

      if (!panel) {
        throw new NotFoundError('Panel not found')
      }

      const baseColumns = await request.store.baseColumn.find(
        { panel: { id: Number(id) } },
        { populate: ['dataSource'] },
      )

      const calculatedColumns = await request.store.calculatedColumn.find({
        panel: { id: Number(id) },
      })

      return {
        baseColumns: baseColumns.map((col) => ({
          ...col,
          columnType: 'base' as const,
        })),
        calculatedColumns: calculatedColumns.map((col) => ({
          ...col,
          columnType: 'calculated' as const,
        })),
      }
    },
  })
}
