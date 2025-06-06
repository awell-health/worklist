# Error Handling

Proper error handling is crucial when working with the Panels API client. This guide covers common error scenarios, best practices, and recovery strategies.

## Overview

The Panels API client provides TypeScript-safe error handling with proper HTTP status codes and meaningful error messages. All API methods return promises that can be caught using try-catch blocks.

## Basic Error Handling

### Simple Try-Catch

\`\`\`typescript
import { panelsAPI } from '@panels/app/api'

async function createPanelSafely() {
  try {
    const panel = await panelsAPI.create({
      name: "My Panel",
      tenantId: "tenant-123",
      userId: "user-456"
    })
    console.log("Panel created:", panel.id)
    return panel
  } catch (error) {
    console.error("Failed to create panel:", error)
    throw error
  }
}
\`\`\`

### Comprehensive Error Handler

\`\`\`typescript
async function handlePanelCreation() {
  try {
    const panel = await panelsAPI.create({
      name: "My Panel",
      tenantId: "tenant-123", 
      userId: "user-456"
    })
    return { success: true, data: panel }
  } catch (error) {
    return { 
      success: false, 
      error: error.message || "Unknown error occurred" 
    }
  }
}

// Usage
const result = await handlePanelCreation()
if (result.success) {
  console.log("Panel created:", result.data.id)
} else {
  console.error("Error:", result.error)
}
\`\`\`

## Common Error Types

### Network Errors

\`\`\`typescript
async function handleNetworkErrors() {
  try {
    const panels = await panelsAPI.all("tenant-123", "user-456")
    return panels
  } catch (error) {
    if (error.name === 'NetworkError' || error.code === 'ECONNREFUSED') {
      console.error("Network connection failed. Check if the server is running.")
      throw new Error("Unable to connect to the server. Please try again later.")
    }
    throw error
  }
}
\`\`\`

### Authentication Errors

\`\`\`typescript
async function handleAuthErrors() {
  try {
    const view = await viewsAPI.create({
      name: "My View",
      panelId: 123,
      config: { columns: ["email"] },
      tenantId: "tenant-123",
      userId: "user-456"
    })
    return view
  } catch (error) {
    if (error.status === 401) {
      console.error("Authentication failed. Please check your credentials.")
      // Redirect to login or refresh token
      window.location.href = '/login'
      return
    }
    if (error.status === 403) {
      console.error("Access forbidden. You don't have permission for this action.")
      throw new Error("Insufficient permissions")
    }
    throw error
  }
}
\`\`\`

### Validation Errors

\`\`\`typescript
async function handleValidationErrors() {
  try {
    const column = await panelsAPI.columns.createBase("123", {
      name: "", // Invalid: empty name
      type: "text",
      sourceField: "email",
      dataSourceId: 456,
      properties: {},
      tenantId: "tenant-123",
      userId: "user-456"
    })
    return column
  } catch (error) {
    if (error.status === 400) {
      console.error("Validation error:", error.message)
      // Extract specific validation errors
      if (error.details) {
        error.details.forEach(detail => {
          console.error(`- ${detail.field}: ${detail.message}`)
        })
      }
      throw new Error("Please check your input and try again")
    }
    throw error
  }
}
\`\`\`

### Resource Not Found

\`\`\`typescript
async function handleNotFoundErrors() {
  try {
    const panel = await panelsAPI.get({ id: 999999 })
    return panel
  } catch (error) {
    if (error.status === 404) {
      console.error("Panel not found")
      return null // Or handle gracefully
    }
    throw error
  }
}
\`\`\`

## Error Recovery Strategies

### Retry with Exponential Backoff

\`\`\`typescript
async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      if (attempt === maxRetries) {
        throw error
      }
      
      // Only retry on network errors or server errors
      if (error.status >= 500 || error.name === 'NetworkError') {
        const delay = baseDelay * Math.pow(2, attempt - 1)
        console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      } else {
        throw error // Don't retry client errors
      }
    }
  }
}

// Usage
const panels = await retryWithBackoff(() => 
  panelsAPI.all("tenant-123", "user-456")
)
\`\`\`

### Graceful Degradation

\`\`\`typescript
async function loadPanelWithFallback(panelId: number) {
  try {
    // Try to load full panel data
    const panel = await panelsAPI.get({ id: panelId })
    const columns = await panelsAPI.columns.list(
      panelId.toString(), 
      "tenant-123", 
      "user-456"
    )
    return { panel, columns, status: 'complete' }
  } catch (error) {
    if (error.status === 404) {
      return { panel: null, columns: null, status: 'not_found' }
    }
    
    try {
      // Fallback: try to load just basic panel info
      const panel = await panelsAPI.get({ id: panelId })
      return { panel, columns: null, status: 'partial' }
    } catch (fallbackError) {
      return { panel: null, columns: null, status: 'error' }
    }
  }
}
\`\`\`

## Error Boundaries for React

\`\`\`typescript
import { Component, ReactNode } from 'react'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

class PanelsErrorBoundary extends Component<
  { children: ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong with the Panels API</h2>
          <details>
            <summary>Error Details</summary>
            <pre>{this.state.error?.message}</pre>
          </details>
          <button onClick={() => window.location.reload()}>
            Reload Page
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

// Usage
function App() {
  return (
    <PanelsErrorBoundary>
      <PanelsDashboard />
    </PanelsErrorBoundary>
  )
}
\`\`\`

## Custom Error Classes

\`\`\`typescript
class PanelsAPIError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: any
  ) {
    super(message)
    this.name = 'PanelsAPIError'
  }
}

class ValidationError extends PanelsAPIError {
  constructor(message: string, public validationErrors: any[]) {
    super(message, 400, validationErrors)
    this.name = 'ValidationError'
  }
}

class NotFoundError extends PanelsAPIError {
  constructor(resource: string, id: string | number) {
    super(`${resource} with ID ${id} not found`, 404)
    this.name = 'NotFoundError'
  }
}

// Usage in API wrapper
async function safeAPICall<T>(apiCall: () => Promise<T>): Promise<T> {
  try {
    return await apiCall()
  } catch (error) {
    if (error.status === 400) {
      throw new ValidationError(error.message, error.details)
    }
    if (error.status === 404) {
      throw new NotFoundError("Resource", "unknown")
    }
    throw new PanelsAPIError(error.message, error.status, error.details)
  }
}
\`\`\`

## Logging and Monitoring

\`\`\`typescript
interface ErrorLogger {
  logError(error: Error, context: any): void
}

class ConsoleErrorLogger implements ErrorLogger {
  logError(error: Error, context: any): void {
    console.error('Panels API Error:', {
      message: error.message,
      name: error.name,
      context,
      timestamp: new Date().toISOString()
    })
  }
}

class APIErrorHandler {
  constructor(private logger: ErrorLogger) {}

  async handleOperation<T>(
    operation: () => Promise<T>,
    context: any
  ): Promise<T> {
    try {
      return await operation()
    } catch (error) {
      this.logger.logError(error, context)
      throw error
    }
  }
}

// Usage
const errorHandler = new APIErrorHandler(new ConsoleErrorLogger())

const panel = await errorHandler.handleOperation(
  () => panelsAPI.create({
    name: "My Panel",
    tenantId: "tenant-123",
    userId: "user-456"
  }),
  { operation: 'createPanel', userId: 'user-456' }
)
\`\`\`

## Best Practices

### 1. Always Handle Errors

\`\`\`typescript
// ❌ Bad: No error handling
const panel = await panelsAPI.create(panelData)

// ✅ Good: Proper error handling
try {
  const panel = await panelsAPI.create(panelData)
  // Handle success
} catch (error) {
  // Handle error
}
\`\`\`

### 2. Provide User-Friendly Messages

\`\`\`typescript
function getErrorMessage(error: any): string {
  switch (error.status) {
    case 400:
      return "Please check your input and try again."
    case 401:
      return "Please log in to continue."
    case 403:
      return "You don't have permission to perform this action."
    case 404:
      return "The requested resource was not found."
    case 500:
      return "A server error occurred. Please try again later."
    default:
      return "An unexpected error occurred. Please try again."
  }
}
\`\`\`

### 3. Log Context Information

\`\`\`typescript
try {
  await panelsAPI.create(panelData)
} catch (error) {
  console.error('Panel creation failed:', {
    error: error.message,
    panelData,
    userId: currentUser.id,
    timestamp: new Date().toISOString()
  })
}
\`\`\`

### 4. Don't Swallow Errors

\`\`\`typescript
// ❌ Bad: Silently ignoring errors
try {
  await panelsAPI.create(panelData)
} catch (error) {
  // Do nothing
}

// ✅ Good: Handle or re-throw
try {
  await panelsAPI.create(panelData)
} catch (error) {
  console.error("Failed to create panel:", error)
  throw new Error("Panel creation failed")
}
\`\`\`

## Testing Error Handling

\`\`\`typescript
import { describe, it, expect, vi } from 'vitest'

describe('Panel API Error Handling', () => {
  it('should handle network errors gracefully', async () => {
    // Mock network error
    vi.spyOn(global, 'fetch').mockRejectedValue(
      new Error('Network Error')
    )

    const result = await handlePanelCreation()
    expect(result.success).toBe(false)
    expect(result.error).toContain('Network')
  })

  it('should handle validation errors', async () => {
    // Mock validation error response
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 400,
      json: () => Promise.resolve({
        message: 'Validation failed',
        details: [{ field: 'name', message: 'Name is required' }]
      })
    })

    await expect(panelsAPI.create(invalidData)).rejects.toThrow('Validation failed')
  })
})
\`\`\`

## Related

- [Authentication Guide](./authentication.md)
- [Testing APIs](./testing-apis.md)
- [Performance Optimization](./caching-responses.md)
