import { NotFoundError } from '@/errors/not-found-error.js'
import { errorSchema } from '@/types.js'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { FilterOperator } from '../entities/view-filter.entity.js'

// Zod Schemas
const paramsSchema = z.object({
  id: z.string(),
})

const querystringSchema = z.object({
  tenantId: z.string(),
  userId: z.string(),
})

const filterSchema = z.object({
  id: z.number(),
  columnName: z.string(),
  operator: z.nativeEnum(FilterOperator),
  value: z.any(),
  logicalOperator: z.enum(['and', 'or']).optional(),
})

const getFiltersResponseSchema = z.object({
  filters: z.array(filterSchema),
})

const updateFiltersBodySchema = z.object({
  filters: z.array(
    z.object({
      columnName: z.string(),
      operator: z.nativeEnum(FilterOperator),
      value: z.any(),
      logicalOperator: z.enum(['and', 'or']).optional(),
    }),
  ),
  tenantId: z.string(),
  userId: z.string(),
})

const updateFiltersResponseSchema = z.object({
  filters: z.array(filterSchema),
})

// Types
type ParamsType = z.infer<typeof paramsSchema>
type QuerystringType = z.infer<typeof querystringSchema>
type GetFiltersResponseType = z.infer<typeof getFiltersResponseSchema>
type UpdateFiltersBodyType = z.infer<typeof updateFiltersBodySchema>
type UpdateFiltersResponseType = z.infer<typeof updateFiltersResponseSchema>

export const viewFilters = async (app: FastifyInstance) => {
  // GET /views/:id/filters - List view filters
  app.withTypeProvider<ZodTypeProvider>().route<{
    Params: ParamsType
    Querystring: QuerystringType
    Reply: GetFiltersResponseType
  }>({
    method: 'GET',
    schema: {
      description: 'Get filters for a view',
      tags: ['view', 'configuration'],
      params: paramsSchema,
      querystring: querystringSchema,
      response: {
        200: getFiltersResponseSchema,
        404: errorSchema,
      },
    },
    url: '/views/:id/filters',
    handler: async (request, reply) => {
      const { id } = request.params
      const { tenantId, userId } = request.query

      // Verify view exists and user has access
      const view = await request.store.view.findOne({
        id: Number(id),
        $or: [
          { ownerUserId: userId, tenantId },
          { isPublished: true, tenantId },
        ],
      })

      if (!view) {
        throw new NotFoundError('View not found')
      }

      const filters = await request.store.viewFilter.find(
        {
          view: { id: Number(id) },
        },
        { populate: ['view'] },
      )

      return {
        filters: filters.map((filter) => ({
          id: filter.id,
          columnName: filter.columnId,
          operator: filter.operator,
          value: filter.value,
          logicalOperator: 'and',
        })),
      }
    },
  })

  // PUT /views/:id/filters - Update view filters
  app.withTypeProvider<ZodTypeProvider>().route<{
    Params: ParamsType
    Body: UpdateFiltersBodyType
    Reply: UpdateFiltersResponseType
  }>({
    method: 'PUT',
    schema: {
      description: 'Update filters for a view (only owner can update)',
      tags: ['view', 'configuration'],
      params: paramsSchema,
      body: updateFiltersBodySchema,
      response: {
        200: updateFiltersResponseSchema,
        404: errorSchema,
        400: errorSchema,
      },
    },
    url: '/views/:id/filters',
    handler: async (request, reply) => {
      const { id } = request.params
      const { filters, tenantId, userId } = request.body

      // Only owner can update their view
      const view = await request.store.view.findOne({
        id: Number(id),
        ownerUserId: userId,
        tenantId,
      })

      if (!view) {
        throw new NotFoundError('View not found')
      }

      // Delete existing filters and create new ones
      await request.store.viewFilter.nativeDelete({
        view: { id: Number(id) },
      })

      const newFilters = filters.map((filter) =>
        request.store.viewFilter.create({
          view,
          columnId: filter.columnName,
          operator: filter.operator,
          value: filter.value,
          // logicalOperator: filter.logicalOperator,
        }),
      )

      // await request.store.viewFilter.persist(newFilters)
      // await request.store.viewFilter.flush()

      return {
        filters: newFilters.map((filter) => ({
          id: filter.id,
          columnName: filter.columnId,
          operator: filter.operator,
          value: filter.value,
          logicalOperator: 'and',
        })),
      }
    },
  })
}
