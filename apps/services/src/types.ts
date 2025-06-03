import { z } from 'zod'

export const errorSchema = z.object({
  message: z.string(),
})

export const viewConfigSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().optional(),
  panelId: z.number(),
  userId: z.string(),
  tenantId: z.string(),
  isPublished: z.boolean(),
  publishedBy: z.string().optional(),
  publishedAt: z.date().optional(),
  config: z.object({
    columns: z.array(z.string()),
    groupBy: z.array(z.string()).optional(),
    layout: z.enum(['table', 'card', 'kanban']).optional(),
  }),
  metadata: z.record(z.any()).optional(),
  panel: z.object({
    id: z.number(),
    name: z.string(),
  }),
})

export type ViewConfig = z.infer<typeof viewConfigSchema>

export const viewListSchema = z.object({
  views: z.array(viewConfigSchema),
  total: z.number(),
})

export type ViewList = z.infer<typeof viewListSchema>
