import { NotFoundError } from "@/errors/not-found-error.js";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { Worklist } from "../entities/worklist.entity.js";
import { ColumnType } from "../entities/worklist-column.entity.js";

const getResponse = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().optional(),
  columns: z.array(z.object({
    id: z.number(),
    name: z.string(),
    type: z.nativeEnum(ColumnType),
    order: z.number(),
    properties: z.record(z.string(), z.any()),
    metadata: z.record(z.string(), z.any()).optional(),
  })),
})

type GetResponse = z.infer<typeof getResponse>;

export const get = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route<{
    Params: {
      id: string;
    };
    Reply: GetResponse;
  }>({
    method: "GET",
    schema: {
      description: "Get a worklist by id",
      tags: ["worklist"],
      params: z.object({
        id: z.string(),
      }),
      response: {
        200: getResponse,
        404: z.object({
          error: z.literal("Worklist not found"),
        }),
      },
    },
    url: "/worklists/:id",
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };
      const worklist = await request.store.em.findOne(Worklist, { id: Number(id) }, { populate: ["columns"] });
      
      if (!worklist) {
        throw new NotFoundError("Worklist not found");
      }

      return {
        id: worklist.id,
        name: worklist.name,
        description: worklist.description,
        columns: worklist.columns.map((column) => ({
          id: column.id,
          name: column.name,
          type: column.type,
          order: column.order,
          properties: column.properties,
          metadata: column.metadata,
        })),
      };
    },
  });
};