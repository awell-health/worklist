# API Reference

Complete reference documentation for the Panels Management System API, including endpoints, schemas, and client libraries.

## Overview

The Panels API is a RESTful service that provides comprehensive functionality for managing panels, data sources, columns, and views in a multi-tenant environment. All endpoints require authentication and tenant context.

## Base Configuration

\`\`\`typescript
import { panelsAPI, viewsAPI } from '@panels/app/api'

// Configure the API client
panelsAPI.configure({
  baseURL: 'https://api.yourcompany.com',
  authentication: {
    type: 'jwt',
    token: 'your-jwt-token'
  }
})
\`\`\`

## API Endpoints

### Core Resources

#### Panels API
- **Base URL**: `/panels`
- **Description**: Manage panel lifecycle, metadata, and configuration
- **Operations**: Create, read, update, delete, list panels

\`\`\`typescript
// Panel operations
const panels = await panelsAPI.panels.list(tenantId, userId)
const panel = await panelsAPI.panels.create(data, tenantId, userId)
const panel = await panelsAPI.panels.get(panelId, tenantId, userId)
const panel = await panelsAPI.panels.update(panelId, data, tenantId, userId)
await panelsAPI.panels.delete(panelId, tenantId, userId)
\`\`\`

#### Data Sources API
- **Base URL**: `/panels/{panelId}/data-sources`
- **Description**: Manage data source connections and synchronization
- **Operations**: Create, read, update, delete, list, sync data sources

\`\`\`typescript
// Data source operations
const sources = await panelsAPI.dataSources.list(panelId, tenantId, userId)
const source = await panelsAPI.dataSources.create(panelId, data, tenantId, userId)
const source = await panelsAPI.dataSources.update(panelId, sourceId, data, tenantId, userId)
const result = await panelsAPI.dataSources.sync(panelId, sourceId, tenantId, userId)
await panelsAPI.dataSources.delete(panelId, sourceId, tenantId, userId)
\`\`\`

#### Columns API
- **Base URL**: `/panels/{panelId}/columns`
- **Description**: Manage panel columns (base and calculated)
- **Operations**: Create base/calculated columns, update, delete, list, reorder

\`\`\`typescript
// Column operations
const columns = await panelsAPI.columns.list(panelId, tenantId, userId)
const column = await panelsAPI.columns.createBase(panelId, data, tenantId, userId)
const column = await panelsAPI.columns.createCalculated(panelId, data, tenantId, userId)
const column = await panelsAPI.columns.update(panelId, columnId, data, tenantId, userId)
await panelsAPI.columns.delete(panelId, columnId, tenantId, userId)
\`\`\`

#### Views API
- **Base URL**: `/panels/{panelId}/views`
- **Description**: Manage panel views, filtering, sorting, and publishing
- **Operations**: Create, update, delete, list, publish, sort views

\`\`\`typescript
// View operations
const views = await viewsAPI.list(panelId, tenantId, userId)
const view = await viewsAPI.create(panelId, data, tenantId, userId)
const view = await viewsAPI.update(panelId, viewId, data, tenantId, userId)
await viewsAPI.publish(panelId, viewId, publishConfig, tenantId, userId)
await viewsAPI.sort(panelId, viewId, sortConfig, tenantId, userId)
await viewsAPI.delete(panelId, viewId, tenantId, userId)
\`\`\`

## Authentication

### JWT Token Authentication

\`\`\`typescript
// Configure with JWT token
panelsAPI.configure({
  baseURL: 'https://api.yourcompany.com',
  authentication: {
    type: 'jwt',
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  }
})
\`\`\`

### API Key Authentication

\`\`\`typescript
// Configure with API key
panelsAPI.configure({
  baseURL: 'https://api.yourcompany.com',
  authentication: {
    type: 'api-key',
    apiKey: 'your-api-key',
    tenantId: 'your-tenant-id'
  }
})
\`\`\`

### Multi-tenant Context

All API operations require tenant and user context:

\`\`\`typescript
// Required parameters for all operations
const tenantId = "tenant-123"  // Organization/workspace identifier
const userId = "user-456"      // Current user identifier

// Example usage
const panels = await panelsAPI.panels.list(tenantId, userId)
\`\`\`

## Request/Response Format

### Standard Response Format

\`\`\`typescript
// Success response
{
  data: T,                    // Response data
  meta?: {                   // Optional metadata
    total?: number,          // Total count for lists
    page?: number,           // Current page
    limit?: number           // Items per page
  }
}

// Error response
{
  error: string,             // Error message
  code: string,              // Error code
  details?: any,             // Additional error details
  timestamp: string          // ISO timestamp
}
\`\`\`

### HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200  | OK | Request successful |
| 201  | Created | Resource created successfully |
| 400  | Bad Request | Invalid request data |
| 401  | Unauthorized | Authentication required |
| 403  | Forbidden | Insufficient permissions |
| 404  | Not Found | Resource not found |
| 409  | Conflict | Resource conflict |
| 422  | Unprocessable Entity | Validation error |
| 429  | Too Many Requests | Rate limit exceeded |
| 500  | Internal Server Error | Server error |

## Data Types and Schemas

### Core Entity Types

\`\`\`typescript
// Panel entity
interface Panel {
  id: string
  title: string
  description?: string
  tenantId: string
  userId: string
  createdAt: Date
  updatedAt: Date
}

// Data Source entity
interface DataSource {
  id: number
  type: 'database' | 'api' | 'file' | 'webhook'
  config: DataSourceConfig
  lastSyncAt?: Date
  tenantId: string
  userId: string
}

// Column entity
interface Column {
  id: number
  title: string
  type: 'base' | 'calculated'
  dataType: DataType
  sourceField?: string        // For base columns
  formula?: string           // For calculated columns
  dependencies?: string[]    // For calculated columns
  displaySettings: DisplaySettings
  validation?: ValidationRules
  tenantId: string
  userId: string
}

// View entity
interface View {
  id: number
  title: string
  description?: string
  filters: FilterCriteria[]
  sorting: SortCriteria[]
  columnVisibility: Record<string, boolean>
  isPublished?: boolean
  publishConfig?: PublishConfig
  tenantId: string
  userId: string
}
\`\`\`

### Data Types

\`\`\`typescript
type DataType = 
  | 'text'
  | 'number'
  | 'email'
  | 'url'
  | 'datetime'
  | 'boolean'
  | 'select'
  | 'json'
\`\`\`

### Configuration Types

\`\`\`typescript
// Data source configurations
interface DatabaseConfig {
  connectionString: string
  schema?: string
  table?: string
  query?: string
}

interface APIConfig {
  apiEndpoint: string
  method: 'GET' | 'POST'
  headers?: Record<string, string>
  authentication?: AuthConfig
  schedule?: string
}

interface FileConfig {
  filePath: string
  format: 'csv' | 'json' | 'excel'
  hasHeaders?: boolean
  delimiter?: string
}
\`\`\`

## Rate Limiting

### Default Limits

| Endpoint Type | Requests | Time Window |
|---------------|----------|-------------|
| Authentication | 10 | 1 minute |
| Panel Operations | 100 | 15 minutes |
| Data Source Sync | 10 | 1 minute |
| View Operations | 200 | 15 minutes |

### Rate Limit Headers

\`\`\`http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
\`\`\`

### Handling Rate Limits

\`\`\`typescript
try {
  const panels = await panelsAPI.panels.list(tenantId, userId)
} catch (error) {
  if (error.status === 429) {
    // Rate limit exceeded
    const retryAfter = error.headers['retry-after']
    console.log(`Rate limited, retry after ${retryAfter} seconds`)
  }
}
\`\`\`

## Error Handling

### Error Types

\`\`\`typescript
// Authentication errors
class AuthenticationError extends Error {
  status: 401 | 403
  code: 'UNAUTHORIZED' | 'FORBIDDEN'
}

// Validation errors
class ValidationError extends Error {
  status: 422
  code: 'VALIDATION_ERROR'
  details: ValidationDetail[]
}

// Not found errors
class NotFoundError extends Error {
  status: 404
  code: 'NOT_FOUND'
  resource: string
}
\`\`\`

### Error Handling Pattern

\`\`\`typescript
import { panelsAPI } from '@panels/app/api'

try {
  const panel = await panelsAPI.panels.get(panelId, tenantId, userId)
} catch (error) {
  switch (error.status) {
    case 401:
      // Handle authentication error
      redirectToLogin()
      break
    case 403:
      // Handle permission error
      showPermissionError()
      break
    case 404:
      // Handle not found
      showNotFoundError()
      break
    case 422:
      // Handle validation error
      showValidationErrors(error.details)
      break
    default:
      // Handle unexpected error
      showGenericError()
  }
}
\`\`\`

## Pagination

### Request Parameters

\`\`\`typescript
// Pagination parameters
interface PaginationParams {
  page?: number        // Page number (1-based)
  limit?: number       // Items per page (max 100)
  sort?: string        // Sort field
  order?: 'asc' | 'desc'  // Sort order
}

// Usage example
const panels = await panelsAPI.panels.list(tenantId, userId, {
  page: 2,
  limit: 20,
  sort: 'title',
  order: 'asc'
})
\`\`\`

### Response Format

\`\`\`typescript
// Paginated response
interface PaginatedResponse<T> {
  data: T[]
  meta: {
    total: number      // Total number of items
    page: number       // Current page
    limit: number      // Items per page
    pages: number      // Total pages
    hasNext: boolean   // Has next page
    hasPrev: boolean   // Has previous page
  }
}
\`\`\`

## Filtering and Searching

### Filter Syntax

\`\`\`typescript
// Filter criteria
interface FilterCriteria {
  field: string
  operator: FilterOperator
  value: any
  logicalOperator?: 'AND' | 'OR'
}

type FilterOperator = 
  | 'equals'
  | 'notEquals'
  | 'contains'
  | 'startsWith'
  | 'endsWith'
  | 'greaterThan'
  | 'lessThan'
  | 'greaterThanOrEqual'
  | 'lessThanOrEqual'
  | 'between'
  | 'in'
  | 'notIn'
  | 'isNull'
  | 'isNotNull'
\`\`\`

### Search Example

\`\`\`typescript
// Search panels by title
const panels = await panelsAPI.panels.list(tenantId, userId, {
  search: 'user dashboard',
  searchFields: ['title', 'description']
})
\`\`\`

## Webhooks

### Webhook Configuration

\`\`\`typescript
// Configure webhook for data source
const dataSource = await panelsAPI.dataSources.create(panelId, {
  type: 'webhook',
  config: {
    endpoint: 'https://your-api.com/webhook',
    secret: 'webhook-secret',
    events: ['data.updated', 'data.created']
  }
}, tenantId, userId)
\`\`\`

### Webhook Events

| Event | Description | Payload |
|-------|-------------|---------|
| `panel.created` | Panel created | Panel object |
| `panel.updated` | Panel updated | Panel object |
| `panel.deleted` | Panel deleted | Panel ID |
| `view.published` | View published | View object |
| `data.synced` | Data source synced | Sync result |

## SDK and Client Libraries

### TypeScript/JavaScript

\`\`\`bash
# Install the official client
pnpm add @panels/app
\`\`\`

\`\`\`typescript
import { panelsAPI, viewsAPI } from '@panels/app/api'

// Configure and use
panelsAPI.configure({ /* config */ })
const panels = await panelsAPI.panels.list(tenantId, userId)
\`\`\`

### Available Methods

See detailed documentation for each API module:

- **[Panels API Methods](./panels.md)** - Complete panels operations
- **[Data Sources API Methods](./data-sources.md)** - Data source management
- **[Columns API Methods](./columns.md)** - Column operations
- **[Views API Methods](./views.md)** - View management and publishing

## Examples and Recipes

### Common Patterns

\`\`\`typescript
// Create a complete panel workflow
async function createCompletePanel() {
  // 1. Create panel
  const panel = await panelsAPI.panels.create({
    title: 'User Dashboard',
    description: 'Dashboard for user management'
  }, tenantId, userId)

  // 2. Add data source
  const dataSource = await panelsAPI.dataSources.create(panel.id, {
    type: 'database',
    config: {
      connectionString: 'postgresql://...',
      table: 'users'
    }
  }, tenantId, userId)

  // 3. Create columns
  const nameColumn = await panelsAPI.columns.createBase(panel.id, {
    title: 'Name',
    sourceField: 'name',
    dataType: 'text'
  }, tenantId, userId)

  // 4. Create view
  const view = await viewsAPI.create(panel.id, {
    title: 'Active Users',
    filters: [{ field: 'status', operator: 'equals', value: 'active' }]
  }, tenantId, userId)

  return panel
}
\`\`\`

## API Versioning

### Current Version

- **Version**: v1
- **Base URL**: `/api/v1`
- **Deprecation Policy**: 12 months notice for breaking changes

### Version Headers

\`\`\`http
Accept: application/vnd.panels.v1+json
API-Version: v1
\`\`\`

## OpenAPI Specification

The complete OpenAPI specification is available at:
- **JSON**: `https://api.yourcompany.com/openapi.json`
- **YAML**: `https://api.yourcompany.com/openapi.yaml`
- **Swagger UI**: `https://api.yourcompany.com/docs`

## Further Reading

- **[Authentication Guide](../authentication/index.md)** - Detailed authentication setup
- **[Data Types Reference](../schemas/data-types.md)** - Complete data type documentation
- **[Error Codes Reference](../errors/index.md)** - All error codes and handling
- **[Rate Limiting Guide](../rate-limiting/index.md)** - Rate limit details and best practices
- **[Bruno API Collection](../bruno-collection/index.md)** - API testing collection
