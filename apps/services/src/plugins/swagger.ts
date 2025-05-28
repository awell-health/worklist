import fp from "fastify-plugin"
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUI from '@fastify/swagger-ui';
import { jsonSchemaTransform } from 'fastify-type-provider-zod';

export default fp(
  async (fastify) => {
    fastify.register(fastifySwagger, {
      openapi: {
        info: {
          title: 'Awell Worklist Server API',
          description: 'Create and manage worklists',
          version: '0.1.0',
        },
        servers: [{
          url: 'http://localhost'
        }],
        tags: [
          { name: 'Worklists', description: 'Manage worklists' },
        ],
      },
      transform: jsonSchemaTransform,
    });

    fastify.register(fastifySwaggerUI, {
      routePrefix: '/docs',
      uiConfig: {
        docExpansion: 'full',
        deepLinking: false,
      },
    });
  },
  { name: "swagger" },
)