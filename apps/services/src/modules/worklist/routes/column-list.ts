import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { NotFoundError } from "@/errors/not-found-error.js";
import { ColumnType } from "../entities/worklist-column.entity.js";

const columnSchema = z.object({
  id: z.number(),
  name: z.string(),
  type: z.nativeEnum(ColumnType),
  order: z.number(),
  properties: z.record(z.string(), z.any()),
  metadata: z.record(z.string(), z.any()).optional(),
});

const columnListResponse = z.array(columnSchema);

type ColumnListResponse = z.infer<typeof columnListResponse>;

export const columnList = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route<{
    Params: {
      id: string;
    };
    Reply: ColumnListResponse;
  }>({
    method: "GET",
    schema: {
      description: "List all the columns for a worklist",
      tags: ["worklist"],
      params: z.object({
        id: z.string(),
      }),
      response: {
        200: columnListResponse,
      },
    },
    url: "/worklists/:id/columns",
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };
      const worklist = await request.store.worklist.findOne(
        { id: Number(id) },
        { populate: ["columns"] }
      );

      if (!worklist) {
        throw new NotFoundError("Worklist not found");
      }

      return worklist.columns.map((column) => ({
        id: column.id,
        name: column.name,
        type: column.type,
        order: column.order,
        properties: column.properties,
        metadata: column.metadata,
      }));
    },
  });
};

