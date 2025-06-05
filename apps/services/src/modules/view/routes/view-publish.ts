import { NotFoundError } from '@/errors/not-found-error.js'
import { ErrorSchema, type IdParam, IdParamSchema } from '@panels/types'
import {
  NotificationImpact,
  NotificationStatus,
} from '@panels/types/view-notifications'
import {
  type ViewPublishInfo,
  ViewPublishInfoSchema,
  type ViewPublishResponse,
  ViewPublishResponseSchema,
} from '@panels/types/views'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'

export const viewPublish = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route<{
    Params: IdParam
    Body: ViewPublishInfo
    Reply: ViewPublishResponse
  }>({
    method: 'POST',
    schema: {
      description:
        'Publish a view to make it tenant-wide (only owner can publish)',
      tags: ['view'],
      params: IdParamSchema,
      body: ViewPublishInfoSchema,
      response: {
        200: ViewPublishResponseSchema,
        404: ErrorSchema,
        400: ErrorSchema,
      },
    },
    url: '/views/:id/publish',
    handler: async (request, reply) => {
      const { id } = request.params
      const { tenantId, userId } = request.body

      // Only owner can publish their own view
      const view = await request.store.view.findOne({
        id: Number(id),
        ownerUserId: userId,
        tenantId,
      })

      if (!view) {
        throw new NotFoundError('View not found')
      }

      // Update view to published status
      view.isPublished = true
      // view.publishedBy = userId
      view.publishedAt = new Date()

      // Create notifications for other users in tenant
      // !!! User still not exists in the system !!!
      // const otherUsers = await request.store.user.find({
      //   tenantId,
      //   id: { $ne: userId },
      // })

      // const notifications = otherUsers.map((user) =>
      const notification = request.store.viewNotification.create({
        view,
        userId,
        // tenantId,
        status: NotificationStatus.PENDING,
        impact: NotificationImpact.INFO,
        message: `New view "${view.name}" has been published`,
        createdAt: new Date(),
      })
      // )

      await request.store.em.persistAndFlush([view, notification])
      return {
        id: view.id,
        name: view.name,
        isPublished: view.isPublished,
        publishedBy: view.ownerUserId,
        publishedAt: view.publishedAt,
      }
    },
  })
}
