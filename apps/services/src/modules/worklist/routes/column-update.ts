import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { ColumnType } from "../entities/worklist-column.entity.js";
import { NotFoundError } from "@/errors/not-found-error.js";

const operationResponse = z.object({
  success: z.boolean(),
  error: z.undefined(),
})

const columnUpdateSchema = z.object({
  name: z.string(),
  type: z.nativeEnum(ColumnType),
  order: z.number(),
  properties: z.record(z.string(), z.any()).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
})

type OperationResponse = z.infer<typeof operationResponse>;
type ColumnUpdateSchema = z.infer<typeof columnUpdateSchema>;

export const columnUpdate = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route<{
    Params: {
      id: string;
      columnId: string;
    },
    Body: ColumnUpdateSchema,
    Reply: OperationResponse
  }>({
    method: 'PUT',
    schema: {
      description: 'Update a column in a worklist',
      tags: ['worklist'],
      params: z.object({
        id: z.string(),
        columnId: z.string(),
      }),
      body: columnUpdateSchema,
      response: {
        200: operationResponse,
      },
    },
    url: '/worklists/:id/columns/:columnId',
    handler: async (request, reply) => {
        const { id, columnId } = request.params as { id: string; columnId: string };
        const column = await request.store.worklistColumn.findOne({
          id: Number(columnId),
          worklist: { id: Number(id), tenantId: '' },
        });
  
        if (!column) {
          throw new NotFoundError('Column not found');
        }
  
        const updateData = request.body;
        request.store.em.assign(column, updateData);
        await request.store.em.flush();
  
        reply.statusCode = 200;
        return { success: true };  
    },
  });
};