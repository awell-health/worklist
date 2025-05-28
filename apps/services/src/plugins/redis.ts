import fp from "fastify-plugin";
import { Redis } from "ioredis";

export default fp(
  async (fastify) => {
    fastify.decorate("redis", new Redis(fastify.configuration.CACHE_URI));
  },
  { name: "redis", dependencies: ["configuration"] }
);

declare module "fastify" {
  interface FastifyInstance {
    redis: Redis;
  }
}
