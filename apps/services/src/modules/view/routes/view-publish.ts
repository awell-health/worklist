import { NotFoundError } from '@/errors/not-found-error.js'
import { errorSchema } from '@/types.js'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import {
  NotificationImpact,
  NotificationStatus,
} from '../../change/entities/view-notification.entity.js'

// Zod Schemas
const paramsSchema = z.object({
  id: z.string(),
})

const bodySchema = z.object({
  tenantId: z.string(),
  userId: z.string(),
})

const responseSchema = z.object({
  id: z.number(),
  name: z.string(),
  isPublished: z.boolean(),
  publishedBy: z.string(),
  publishedAt: z.date(),
})

// Types
type ParamsType = z.infer<typeof paramsSchema>
type BodyType = z.infer<typeof bodySchema>
type ResponseType = z.infer<typeof responseSchema>

export const viewPublish = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route<{
    Params: ParamsType
    Body: BodyType
    Reply: ResponseType
  }>({
    method: 'POST',
    schema: {
      description:
        'Publish a view to make it tenant-wide (only owner can publish)',
      tags: ['view'],
      params: paramsSchema,
      body: bodySchema,
      response: {
        200: responseSchema,
        404: errorSchema,
        400: errorSchema,
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
