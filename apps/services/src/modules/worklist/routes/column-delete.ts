import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { NotFoundError } from "@/errors/not-found-error.js";
import { z } from "zod";

const operationResponse = z.object({
  success: z.literal(true),
  error: z.undefined(),
});

type OperationResponse = z.infer<typeof operationResponse>;

export const columnDelete = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route<{
    Params: {
      id: string;
      columnId: string;
    };
    Reply: OperationResponse;
  }>({
    method: "DELETE",
    url: "/worklists/:id/columns/:columnId",
    handler: async (request, reply) => {
      const { id, columnId } = request.params as {
        id: string;
        columnId: string;
      };
      const column = await request.store.worklistColumn.findOne({
        id: Number(columnId),
        worklist: { id: Number(id), tenantId: "" },
      });

      if (!column) {
        throw new NotFoundError("Column not found");
      }

      await request.store.em.removeAndFlush(column);
      reply.statusCode = 204;
      return { success: true };
    },
  });
};
