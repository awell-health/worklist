import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { Worklist } from "../entities/worklist.entity.js";
import { NotFoundError } from "@/errors/not-found-error.js";
import z from "zod";

const updateResponse = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().optional(),
});

const updateSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
});

type UpdateSchema = z.infer<typeof updateSchema>;
type UpdateResponse = z.infer<typeof updateResponse>;

export const update = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route<{
    Params: {
      id: string;
    };
    Body: UpdateSchema;
    Reply: UpdateResponse;
  }>({
    method: "PUT",
    url: "/worklists/:id",
    schema: {
      description: "Update a worklist by id",
      tags: ["worklist"],
      params: z.object({
        id: z.string(),
      }),
      body: updateSchema,
      response: {
        200: updateResponse,
        404: z.object({
          error: z.literal("Worklist not found"),
        }),
      },
    },
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };
      const { name, description } = request.body as { name?: string; description?: string };    
      const worklist = await request.store.em.findOne(Worklist, { id: Number(id) });
      if (!worklist) {
        throw new NotFoundError("Worklist not found");
      }
      if (name) worklist.name = name;
      if (description !== undefined) worklist.description = description;
      await request.store.em.flush();

      return {
        id: worklist.id,
        name: worklist.name,
        description: worklist.description,
      };
    },
  });
};