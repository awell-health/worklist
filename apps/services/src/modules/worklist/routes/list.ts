import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { Worklist } from "../entities/worklist.entity.js";
import { ColumnType } from "../entities/worklist-column.entity.js";

const listResponse = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().optional(),
  columns: z.array(z.object({
    id: z.number(),
    name: z.string(),
    type: z.nativeEnum(ColumnType),
    order: z.number(),
  })),
})

type ListResponse = z.infer<typeof listResponse>;

export const list = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route<{
    Reply: ListResponse[];
  }>({
    method: "GET",
    schema: {
      description: "List all worklists",
      tags: ["worklist"],
      response: {
        200: z.array(listResponse),
      },
    },
    url: "/worklists",
    handler: async (request, reply) => {
      const worklists = await request.store.em.find(Worklist, {}, { populate: ["columns"] });

      reply.statusCode = 200;
      return worklists.map((worklist) => ({
        id: worklist.id,
        name: worklist.name,
        description: worklist.description,
        columns: worklist.columns.map((column) => ({
          id: column.id,
          name: column.name,
          type: column.type,
          order: column.order,
        })),
      }));
    },
  });
};