import {
  NotificationImpact,
  NotificationStatus,
  type ViewNotification,
} from '@/modules/change/entities/view-notification.entity.js'
import { errorSchema } from '@/types.js'
import type { FilterQuery } from '@mikro-orm/core'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

// Zod Schemas
const querystringSchema = z.object({
  tenantId: z.string(),
  userId: z.string(),
  isRead: z.boolean().optional(),
  notificationType: z.nativeEnum(NotificationImpact).optional(),
  since: z.string().optional(), // ISO date string
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
})

const viewNotificationSchema = z.object({
  id: z.number(),
  viewId: z.number(),
  userId: z.string(),
  tenantId: z.string(),
  impact: z.nativeEnum(NotificationImpact),
  message: z.string(),
  isRead: z.boolean(),
  createdAt: z.date(),
  readAt: z.date().optional(),
  view: z.object({
    id: z.number(),
    name: z.string(),
    panelId: z.number(),
    publishedBy: z.string().optional(),
  }),
})

const getNotificationsResponseSchema = z.object({
  notifications: z.array(viewNotificationSchema),
  total: z.number(),
  unreadCount: z.number(),
  hasMore: z.boolean(),
})

const markReadBodySchema = z.object({
  notificationIds: z.array(z.number()),
  tenantId: z.string(),
  userId: z.string(),
})

const markReadResponseSchema = z.object({
  updated: z.number(),
})

// Types
type QuerystringType = z.infer<typeof querystringSchema>
type GetNotificationsResponseType = z.infer<
  typeof getNotificationsResponseSchema
>
type MarkReadBodyType = z.infer<typeof markReadBodySchema>
type MarkReadResponseType = z.infer<typeof markReadResponseSchema>

export const viewNotifications = async (app: FastifyInstance) => {
  // GET /notifications/views - List view notifications
  app.withTypeProvider<ZodTypeProvider>().route<{
    Querystring: QuerystringType
    Reply: GetNotificationsResponseType
  }>({
    method: 'GET',
    schema: {
      description: 'List view notifications for user',
      tags: ['change-tracking', 'notifications'],
      querystring: querystringSchema,
      response: {
        200: getNotificationsResponseSchema,
      },
    },
    url: '/notifications/views',
    handler: async (request, reply) => {
      const {
        tenantId,
        userId,
        isRead,
        notificationType,
        since,
        limit,
        offset,
      } = request.query

      const where: FilterQuery<ViewNotification> = {
        userId,
        view: {
          tenantId,
        },
      }

      if (isRead !== undefined) {
        where.status = isRead
          ? NotificationStatus.ACKNOWLEDGED
          : NotificationStatus.PENDING
      }

      if (notificationType) {
        where.impact = notificationType
      }

      if (since) {
        where.createdAt = { $gte: new Date(since) }
      }

      const [notifications, total, unreadCount] = await Promise.all([
        request.store.viewNotification.find(where, {
          populate: ['view'],
          orderBy: { createdAt: 'DESC' },
          limit,
          offset,
        }),
        request.store.em.count('ViewNotification', where),
        request.store.em.count('ViewNotification', {
          userId,
          tenantId,
          isRead: false,
        }),
      ])

      return {
        notifications: notifications.map((notification) => ({
          id: notification.id,
          viewId: notification.view.id,
          userId: notification.userId,
          tenantId: notification.view.tenantId,
          impact: notification.impact,
          message: notification.message,
          isRead: notification.status === NotificationStatus.ACKNOWLEDGED,
          createdAt: notification.createdAt,
          readAt: notification.acknowledgedAt,
          view: {
            id: notification.view.id,
            name: notification.view.name,
            panelId: notification.view.panel.id,
            publishedBy: '',
          },
        })),
        total,
        unreadCount,
        hasMore: total > offset + limit,
      }
    },
  })

  // PUT /notifications/views/mark-read - Mark notifications as read
  app.withTypeProvider<ZodTypeProvider>().route<{
    Body: MarkReadBodyType
    Reply: MarkReadResponseType
  }>({
    method: 'PUT',
    schema: {
      description: 'Mark view notifications as read',
      tags: ['change-tracking', 'notifications'],
      body: markReadBodySchema,
      response: {
        200: markReadResponseSchema,
        400: errorSchema,
      },
    },
    url: '/notifications/views/mark-read',
    handler: async (request, reply) => {
      const { notificationIds, tenantId, userId } = request.body

      const updated = await request.store.em.nativeUpdate(
        'ViewNotification',
        {
          id: { $in: notificationIds },
          userId,
          tenantId,
          isRead: false, // Only update unread notifications
        },
        {
          isRead: true,
          readAt: new Date(),
        },
      )

      return { updated }
    },
  })
}
