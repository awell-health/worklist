import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUI from '@fastify/swagger-ui'
import fp from 'fastify-plugin'
import { jsonSchemaTransform } from 'fastify-type-provider-zod'

export default fp(
  async (fastify) => {
    fastify.register(fastifySwagger, {
      openapi: {
        info: {
          title: 'Awell Panels Server API',
          description: 'Create and manage worklist panels',
          version: '0.2.0',
        },
        servers: [
          {
            url: 'http://localhost',
          },
        ],
        tags: [{ name: 'Panels', description: 'Manage panels' }],
      },
      transform: jsonSchemaTransform,
    })

    fastify.register(fastifySwaggerUI, {
      routePrefix: '/docs',
      uiConfig: {
        docExpansion: 'full',
        deepLinking: false,
      },
    })
  },
  { name: 'swagger' },
)
