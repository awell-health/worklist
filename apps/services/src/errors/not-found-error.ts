// Factory function approach that works regardless of how it's called
export function NotFoundError(message = "Not Found", detail?: string) {
  // If called without new, ensure we create a proper instance
  if (!(this instanceof NotFoundError)) {
    return new (NotFoundError as any)(message, detail)
  }

  // Standard error setup
  const error = new Error(message)
  error.name = "NotFoundError"
  Object.setPrototypeOf(error, NotFoundError.prototype)

  // Add custom properties
  ;(error as any).statusCode = 404
  ;(error as any).detail = detail

  // Capture stack trace
  if (Error.captureStackTrace) {
    Error.captureStackTrace(error, NotFoundError)
  }

  return error
}

// Set up prototype chain correctly
NotFoundError.prototype = Object.create(Error.prototype)
NotFoundError.prototype.constructor = NotFoundError

// Helper function to check if an error is a NotFoundError
export function isNotFoundError(error: any): boolean {
  return error && (error instanceof NotFoundError || error.name === "NotFoundError" || error.statusCode === 404)
}

// Export as default for compatibility
export default NotFoundError
