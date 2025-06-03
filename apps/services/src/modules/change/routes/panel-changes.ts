import type { FilterQuery } from '@mikro-orm/core'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import {
  ChangeType,
  type PanelChange,
} from '../entities/panel-change.entity.js'

// Zod Schemas
const querystringSchema = z.object({
  tenantId: z.string(),
  userId: z.string(),
  panelId: z.string().optional(),
  changeType: z.nativeEnum(ChangeType).optional(),
  since: z.string().optional(), // ISO date string
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
})

const panelChangeSchema = z.object({
  id: z.number(),
  panelId: z.number(),
  changeType: z.nativeEnum(ChangeType),
  description: z.string(),
  changedBy: z.string(),
  changedAt: z.date(),
  oldValues: z.record(z.any()).optional(),
  newValues: z.record(z.any()).optional(),
  affectedColumn: z.string().optional(),
})

const responseSchema = z.object({
  changes: z.array(panelChangeSchema),
  total: z.number(),
  hasMore: z.boolean(),
})

// Types
type QuerystringType = z.infer<typeof querystringSchema>
type ResponseType = z.infer<typeof responseSchema>

export const panelChanges = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route<{
    Querystring: QuerystringType
    Reply: ResponseType
  }>({
    method: 'GET',
    schema: {
      description: 'List panel changes with affected views',
      tags: ['change-tracking'],
      querystring: querystringSchema,
      response: {
        200: responseSchema,
      },
    },
    url: '/changes/panels',
    handler: async (request, reply) => {
      const { tenantId, userId, panelId, changeType, since, limit, offset } =
        request.query

      const where: FilterQuery<PanelChange> = {
        panel: {
          $or: [
            { userId, tenantId }, // User's own panels
            {
              // Panels with published views in tenant
              views: {
                isPublished: true,
                tenantId,
              },
            },
          ],
        },
      }

      if (panelId) {
        where.panel = { id: Number(panelId) }
      }

      if (changeType) {
        where.changeType = changeType as ChangeType
      }

      if (since) {
        where.createdAt = { $gte: new Date(since) }
      }

      const [changes, total] = await Promise.all([
        request.store.panelChange.find(where, {
          populate: ['panel', 'affectedColumn'],
          orderBy: { createdAt: 'DESC' },
          limit,
          offset,
        }),
        request.store.em.count('PanelChange', where),
      ])

      return {
        changes: changes.map((change) => ({
          id: change.id,
          panelId: change.panel.id,
          changeType: change.changeType,
          description: change.changeDetails.description,
          changedBy: change.panel.userId,
          changedAt: change.createdAt,
          affectedColumn: change.affectedColumn,
        })),
        total,
        hasMore: total > offset + limit,
      }
    },
  })
}
