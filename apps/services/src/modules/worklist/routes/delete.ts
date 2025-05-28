import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { Worklist } from "../entities/worklist.entity.js";
import { NotFoundError } from "@/errors/not-found-error.js";

const deleteResponse = z.object({
  success: z.boolean(),
});

type DeleteResponse = z.infer<typeof deleteResponse>;

export const deleteWorklist = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route<{
    Params: {
      id: string;
    };
    Reply: DeleteResponse;
  }>({
    method: "DELETE",
    url: "/worklists/:id",
    schema: {
      description: "Delete a worklist by id",
      tags: ["worklist"],
      params: z.object({
        id: z.string(),
      }),
      response: {
        200: deleteResponse,
        404: z.object({
          error: z.literal("Worklist not found"),
        }),
      },
    },
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };
      const worklist = await request.store.em.findOne(Worklist, {
        id: Number(id),
      });
      if (!worklist) {
        throw new NotFoundError("Worklist not found");
      }
      await request.store.em.removeAndFlush(worklist);
      return { success: true };
    },
  });
};
