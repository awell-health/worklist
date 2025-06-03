import { NotFoundError } from '@/errors/not-found-error.js'
import { errorSchema } from '@/types.js'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { SortDirection } from '../entities/view-sort.entity.js'

// Zod Schemas
const paramsSchema = z.object({
  id: z.string(),
})

const querystringSchema = z.object({
  tenantId: z.string(),
  userId: z.string(),
})

const sortSchema = z.object({
  id: z.number(),
  columnName: z.string(),
  direction: z.nativeEnum(SortDirection),
  order: z.number(),
})

const getSortsResponseSchema = z.object({
  sorts: z.array(sortSchema),
})

const updateSortsBodySchema = z.object({
  sorts: z.array(
    z.object({
      columnName: z.string(),
      direction: z.nativeEnum(SortDirection),
      order: z.number(),
    }),
  ),
  tenantId: z.string(),
  userId: z.string(),
})

const updateSortsResponseSchema = z.object({
  sorts: z.array(sortSchema),
})

// Types
type ParamsType = z.infer<typeof paramsSchema>
type QuerystringType = z.infer<typeof querystringSchema>
type GetSortsResponseType = z.infer<typeof getSortsResponseSchema>
type UpdateSortsBodyType = z.infer<typeof updateSortsBodySchema>
type UpdateSortsResponseType = z.infer<typeof updateSortsResponseSchema>

export const viewSorts = async (app: FastifyInstance) => {
  // GET /views/:id/sorts - List view sorts
  app.withTypeProvider<ZodTypeProvider>().route<{
    Params: ParamsType
    Querystring: QuerystringType
    Reply: GetSortsResponseType
  }>({
    method: 'GET',
    schema: {
      description: 'Get sorts for a view',
      tags: ['view', 'configuration'],
      params: paramsSchema,
      querystring: querystringSchema,
      response: {
        200: getSortsResponseSchema,
        404: errorSchema,
      },
    },
    url: '/views/:id/sorts',
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

      const sorts = await request.store.viewSort.find(
        { view: { id: Number(id) } },
        { orderBy: { order: 'ASC' } },
      )

      return {
        sorts: sorts.map((sort) => ({
          id: sort.id,
          columnName: sort.columnName,
          direction: sort.direction,
          order: sort.order,
        })),
      }
    },
  })

  // PUT /views/:id/sorts - Update view sorts
  app.withTypeProvider<ZodTypeProvider>().route<{
    Params: ParamsType
    Body: UpdateSortsBodyType
    Reply: UpdateSortsResponseType
  }>({
    method: 'PUT',
    schema: {
      description: 'Update sorts for a view (only owner can update)',
      tags: ['view', 'configuration'],
      params: paramsSchema,
      body: updateSortsBodySchema,
      response: {
        200: updateSortsResponseSchema,
        404: errorSchema,
        400: errorSchema,
      },
    },
    url: '/views/:id/sorts',
    handler: async (request, reply) => {
      const { id } = request.params
      const { sorts, tenantId, userId } = request.body

      // Only owner can update their view
      const view = await request.store.view.findOne({
        id: Number(id),
        ownerUserId: userId,
        tenantId,
      })

      if (!view) {
        throw new NotFoundError('View not found')
      }

      // Delete existing sorts and create new ones
      await request.store.viewSort.nativeDelete({
        view: { id: Number(id) },
      })

      const newSorts = sorts.map((sort) =>
        request.store.viewSort.create({
          view,
          columnName: sort.columnName,
          direction: sort.direction,
          order: sort.order,
        }),
      )

      await request.store.em.persistAndFlush(newSorts)
      return {
        sorts: newSorts.map((sort) => ({
          id: sort.id,
          columnName: sort.columnName,
          direction: sort.direction,
          order: sort.order,
        })),
      }
    },
  })
}
