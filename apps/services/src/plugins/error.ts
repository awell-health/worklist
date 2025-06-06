import { ZodError } from "zod"
import fp from "fastify-plugin"
import { isNotFoundError } from "@/errors/not-found-error.js"

export default fp(
  async (fastify) => {
    // Set a custom error handler
    fastify.setErrorHandler((error, request, reply) => {
      // Default HTTP status code
      let statusCode = 500
      let errorMessage = "Internal Server Error"

      try {
        // Check for NotFoundError using our helper function
        if (isNotFoundError(error)) {
          statusCode = 404
          errorMessage = error.message || "Not Found"
        }
        // If this is a Fastify validation error
        else if (error.validation) {
          statusCode = 400
          errorMessage = "Validation Error"
        }
        // If it's a Zod error
        else if (error instanceof ZodError) {
          statusCode = 400
          errorMessage = "Validation Error"
        }
        // If the error object contains a statusCode, prefer that
        else if (error.statusCode && typeof error.statusCode === "number") {
          statusCode = error.statusCode
          errorMessage = error.message || errorMessage
        }
      } catch (checkError) {
        // If error checking fails, use defaults
        fastify.log.warn("Error during error type checking:", checkError)
      }

      // Build the response payload
      const payload = {
        statusCode,
        error: errorMessage,
        message: error.message || errorMessage,
        // Some additional details if you want
        details:
          error instanceof ZodError
            ? error.issues.map((issue) => ({
                path: issue.path.join("."),
                message: issue.message,
              }))
            : error.validation // fastify's built-in validation errors, if any
              ? error.validation
              : undefined,
        ...(fastify.configuration.NODE_ENV !== "production" ? { stack: error.stack } : {}),
      }

      // Optionally, log the full error (stack trace) for debugging
      request.log.error(error)

      // Send the response
      reply.status(statusCode).send(payload)
    })
  },
  { name: "error" },
)
