import { NotFoundError } from '@/errors/not-found-error.js'
import { errorSchema } from '@/types.js'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import type { BaseColumn } from '../entities/base-column.entity.js'
import type { CalculatedColumn } from '../entities/calculated-column.entity.js'

// Zod Schemas
const paramsSchema = z.object({
  id: z.string(),
  colId: z.string(),
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
  name: z.string().optional(),
  properties: columnPropertiesSchema.optional(),
  metadata: z.record(z.any()).optional(),
  // For calculated columns
  formula: z.string().optional(),
  dependencies: z.array(z.string()).optional(),
  // For base columns
  sourceField: z.string().optional(),
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
  properties: columnPropertiesSchema,
  metadata: z.record(z.any()).optional(),
})

// Types
type ParamsType = z.infer<typeof paramsSchema>
type BodyType = z.infer<typeof bodySchema>
type ResponseType = z.infer<typeof responseSchema>

export const columnUpdate = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route<{
    Params: ParamsType
    Body: BodyType
    Reply: ResponseType
  }>({
    method: 'PUT',
    schema: {
      description: 'Update a column (base or calculated)',
      tags: ['panel', 'column'],
      params: paramsSchema,
      body: bodySchema,
      response: {
        200: responseSchema,
        404: errorSchema,
        400: errorSchema,
      },
    },
    url: '/panels/:id/columns/:colId',
    handler: async (request, reply) => {
      const { id, colId } = request.params
      const {
        name,
        properties,
        metadata,
        formula,
        dependencies,
        sourceField,
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

      // Try to find as base column first
      let column: BaseColumn | CalculatedColumn | null =
        await request.store.baseColumn.findOne({
          id: Number(colId),
          panel: { id: Number(id) },
        })

      // If not found, try calculated column
      if (!column) {
        column = await request.store.calculatedColumn.findOne({
          id: Number(colId),
          panel: { id: Number(id) },
        })
      }

      if (!column) {
        throw new NotFoundError('Column not found')
      }

      // Update common fields
      if (name) column.name = name
      if (properties) column.properties = properties
      if (metadata !== undefined) column.metadata = metadata

      // Update specific fields based on column type
      if ('formula' in column) {
        // Calculated column
        if (formula) column.formula = formula
        if (dependencies) column.dependencies = dependencies
      } else if ('sourceField' in column) {
        // Base column
        if (sourceField) column.sourceField = sourceField
      }

      await request.store.em.flush()
      return column
    },
  })
}
