import type{ FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { ColumnType, WorklistColumn } from "../entities/worklist-column.entity.js";
import { NotFoundError } from "@/errors/not-found-error.js";

const operationResponse = z.object({
  success: z.literal(true),
  error: z.undefined(),
})

const columnCreateSchema = z.object({
  name: z.string(),
  type: z.nativeEnum(ColumnType),
  order: z.number(),
  properties: z.record(z.string(), z.any()),
  metadata: z.record(z.string(), z.any()).optional(),
})

type OperationResponse = z.infer<typeof operationResponse>;
type ColumnCreateSchema = z.infer<typeof columnCreateSchema>;

export const columnCreate = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route<{
    Params: {
      id: string;
    },
    Body: ColumnCreateSchema,
    Reply: OperationResponse
  }>({
    method: 'POST',
    schema: {
      description: 'Create a column in a worklist',
      tags: ['worklist'],
      params: z.object({
        id: z.string(),
      }),
      body: columnCreateSchema,
      response: {
        200: operationResponse,
      },
    },
    url: '/worklists/:id/columns',
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };
      const worklist = await request.store.worklist.findOne({ id: Number(id) });        

      if (!worklist) {
        throw new NotFoundError('Worklist not found');
      }

      const columnData = request.body;
      const column = request.store.em.create(WorklistColumn, {
        ...columnData,
        worklist,
      });

      await request.store.em.persistAndFlush(column);
      return { success: true };
    },
  });
};
