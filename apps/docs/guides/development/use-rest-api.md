# How to use the REST API

This guide shows you how to use the current REST API endpoints that are available in the Panels system.

## Prerequisites

- Access to the API server (typically running on port 3001)
- Understanding of REST APIs and HTTP methods
- Valid tenant ID and user ID for multi-tenant requests

## Current API Endpoints

Based on the current implementation, here are the available endpoints:

### Panel Management

#### List Panels
\`\`\`http
GET /api/panels?tenantId={tenantId}&userId={userId}
\`\`\`

**Example Request:**
\`\`\`bash
curl -X GET "http://localhost:3001/api/panels?tenantId=tenant-123&userId=user-456" \
  -H "Content-Type: application/json"
\`\`\`

**Response:**
\`\`\`json
[
  {
    "id": 1,
    "name": "Patient Care Panel",
    "description": "Main patient management panel",
    "tenantId": "tenant-123", 
    "userId": "user-456",
    "cohortRule": {
      "conditions": [],
      "logic": "AND"
    },
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z"
  }
]
\`\`\`

#### Get Panel by ID
\`\`\`http
GET /api/panels/{id}?tenantId={tenantId}&userId={userId}
\`\`\`

**Example Request:**
\`\`\`bash
curl -X GET "http://localhost:3001/api/panels/1?tenantId=tenant-123&userId=user-456" \
  -H "Content-Type: application/json"
\`\`\`

**Response:**
\`\`\`json
{
  "id": 1,
  "name": "Patient Care Panel",
  "description": "Main patient management panel",
  "tenantId": "tenant-123",
  "userId": "user-456", 
  "cohortRule": {
    "conditions": [],
    "logic": "AND"
  },
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z"
}
\`\`\`

#### Create Panel
\`\`\`http
POST /api/panels
\`\`\`

**Request Body:**
\`\`\`json
{
  "name": "New Patient Panel",
  "description": "Panel for managing new patients",
  "tenantId": "tenant-123",
  "userId": "user-456"
}
\`\`\`

**Example Request:**
\`\`\`bash
curl -X POST "http://localhost:3001/api/panels" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Patient Panel", 
    "description": "Panel for managing new patients",
    "tenantId": "tenant-123",
    "userId": "user-456"
  }'
\`\`\`

**Response (201 Created):**
\`\`\`json
{
  "id": 2,
  "name": "New Patient Panel",
  "description": "Panel for managing new patients", 
  "tenantId": "tenant-123",
  "userId": "user-456",
  "cohortRule": {
    "conditions": [],
    "logic": "AND"
  },
  "createdAt": "2024-01-15T14:30:00Z",
  "updatedAt": "2024-01-15T14:30:00Z"
}
\`\`\`

#### Update Panel
\`\`\`http
PUT /api/panels/{id}
\`\`\`

**Request Body:**
\`\`\`json
{
  "name": "Updated Panel Name",
  "description": "Updated description",
  "tenantId": "tenant-123", 
  "userId": "user-456"
}
\`\`\`

#### Delete Panel
\`\`\`http
DELETE /api/panels/{id}
\`\`\`

**Request Body:**
\`\`\`json
{
  "tenantId": "tenant-123",
  "userId": "user-456"
}
\`\`\`

### Data Source Management

#### List Data Sources for Panel
\`\`\`http
GET /api/panels/{panelId}/datasources
\`\`\`

#### Create Data Source
\`\`\`http
POST /api/panels/{panelId}/datasources
\`\`\`

**Request Body:**
\`\`\`json
{
  "type": "fhir",
  "config": {
    "baseUrl": "https://api.medplum.com/fhir/R4/",
    "clientId": "your-client-id"
  },
  "tenantId": "tenant-123",
  "userId": "user-456"
}
\`\`\`

#### Sync Data Source
\`\`\`http
POST /api/datasources/{datasourceId}/sync
\`\`\`

### Column Management

#### List Columns for Panel
\`\`\`http
GET /api/panels/{panelId}/columns
\`\`\`

#### Create Base Column
\`\`\`http
POST /api/panels/{panelId}/columns/base
\`\`\`

**Request Body:**
\`\`\`json
{
  "name": "Patient Name", 
  "fhirPath": "Patient.name.given[0] + ' ' + Patient.name.family",
  "type": "string",
  "properties": {},
  "metadata": {},
  "tenantId": "tenant-123",
  "userId": "user-456"
}
\`\`\`

#### Create Calculated Column
\`\`\`http
POST /api/panels/{panelId}/columns/calculated
\`\`\`

**Request Body:**
\`\`\`json
{
  "name": "Age",
  "type": "number",
  "formula": "DATEDIFF('year', Patient.birthDate, NOW())",
  "dependencies": ["Patient.birthDate"],
  "properties": {},
  "metadata": {},
  "tenantId": "tenant-123", 
  "userId": "user-456"
}
\`\`\`

### View Management

#### List Views
\`\`\`http
GET /api/views?tenantId={tenantId}&userId={userId}
\`\`\`

#### Get View by ID
\`\`\`http
GET /api/views/{viewId}?tenantId={tenantId}&userId={userId}
\`\`\`

#### Create View
\`\`\`http
POST /api/views
\`\`\`

**Request Body:**
\`\`\`json
{
  "name": "High Priority Patients",
  "panelId": 1,
  "config": {
    "columns": ["patient_name", "age", "last_visit"],
    "groupBy": [],
    "layout": "table"
  },
  "tenantId": "tenant-123",
  "userId": "user-456"
}
\`\`\`

**Response (201 Created):**
\`\`\`json
{
  "id": 10,
  "name": "High Priority Patients",
  "description": "",
  "panelId": 1,
  "userId": "user-456",
  "tenantId": "tenant-123", 
  "isPublished": false,
  "config": {
    "columns": ["patient_name", "age", "last_visit"],
    "groupBy": [],
    "layout": "table"
  }
}
\`\`\`

#### Update View
\`\`\`http
PUT /api/views/{viewId}
\`\`\`

#### Publish View
\`\`\`http
POST /api/views/{viewId}/publish
\`\`\`

**Request Body:**
\`\`\`json
{
  "tenantId": "tenant-123",
  "userId": "user-456"
}
\`\`\`

### Change Tracking

#### Get Panel Changes
\`\`\`http
GET /api/changes/panels?tenantId={tenantId}&userId={userId}&since={timestamp}
\`\`\`

#### Get View Notifications
\`\`\`http
GET /api/notifications/views?tenantId={tenantId}&userId={userId}&isRead=false
\`\`\`

## Using JavaScript/TypeScript

### Basic Setup
\`\`\`typescript
const API_BASE_URL = 'http://localhost:3001'

// Helper function for API calls
async function apiCall(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })
  
  if (!response.ok) {
    throw new Error(`API call failed: ${response.status} ${response.statusText}`)
  }
  
  return response.json()
}
\`\`\`

### Example Operations

#### Fetch All Panels
\`\`\`typescript
async function getAllPanels(tenantId: string, userId: string) {
  try {
    const panels = await apiCall(
      `/api/panels?tenantId=${tenantId}&userId=${userId}`
    )
    console.log('Panels:', panels)
    return panels
  } catch (error) {
    console.error('Failed to fetch panels:', error)
    throw error
  }
}
\`\`\`

#### Create a New Panel
\`\`\`typescript
async function createPanel(
  name: string, 
  description: string,
  tenantId: string, 
  userId: string
) {
  try {
    const panel = await apiCall('/api/panels', {
      method: 'POST',
      body: JSON.stringify({
        name,
        description,
        tenantId,
        userId
      })
    })
    console.log('Created panel:', panel)
    return panel
  } catch (error) {
    console.error('Failed to create panel:', error) 
    throw error
  }
}
\`\`\`

#### Create a View
\`\`\`typescript
async function createView(
  name: string,
  panelId: number, 
  columns: string[],
  tenantId: string,
  userId: string
) {
  try {
    const view = await apiCall('/api/views', {
      method: 'POST',
      body: JSON.stringify({
        name,
        panelId,
        config: {
          columns,
          groupBy: [],
          layout: 'table'
        },
        tenantId,
        userId
      })
    })
    console.log('Created view:', view)
    return view
  } catch (error) {
    console.error('Failed to create view:', error)
    throw error
  }
}
\`\`\`

### Using the Existing API Client

The codebase includes existing API client functions:

\`\`\`typescript
import { panelsAPI } from '@panels/app/api'
import { viewsAPI } from '@panels/app/api'

// List panels
const panels = await panelsAPI.all('tenant-123', 'user-456')

// Get specific panel  
const panel = await panelsAPI.get({ id: 1 })

// Create panel
const newPanel = await panelsAPI.create({
  name: 'Test Panel',
  description: 'A test panel',
  tenantId: 'tenant-123',
  userId: 'user-456'
})

// List views
const views = await viewsAPI.all('tenant-123', 'user-456')

// Create view
const newView = await viewsAPI.create({
  name: 'Test View',
  panelId: 1,
  config: {
    columns: ['patient_name', 'age'],
    groupBy: [],
    layout: 'table'
  },
  tenantId: 'tenant-123',
  userId: 'user-456'
})
\`\`\`

## Error Handling

### Common HTTP Status Codes
- **200 OK**: Request successful
- **201 Created**: Resource created successfully
- **400 Bad Request**: Invalid request data
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Access denied for tenant/user
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server error

### Example Error Response
\`\`\`json
{
  "error": "Panel not found",
  "statusCode": 404,
  "message": "Panel with ID 999 not found for tenant tenant-123"
}
\`\`\`

### Error Handling in Code
\`\`\`typescript
async function safeApiCall(endpoint: string, options?: RequestInit) {
  try {
    return await apiCall(endpoint, options)
  } catch (error) {
    if (error instanceof Error) {
      console.error('API Error:', error.message)
      
      // Handle specific error cases
      if (error.message.includes('404')) {
        console.log('Resource not found')
      } else if (error.message.includes('403')) {
        console.log('Access denied')
      } else if (error.message.includes('400')) {
        console.log('Invalid request data')
      }
    }
    throw error
  }
}
\`\`\`

## Multi-Tenancy

All API calls require `tenantId` and `userId` parameters to ensure proper data isolation:

\`\`\`typescript
// Always include tenant and user context
const apiParams = {
  tenantId: 'your-tenant-id',
  userId: 'your-user-id'
}

// Include in query parameters for GET requests
const panels = await apiCall(
  `/api/panels?tenantId=${apiParams.tenantId}&userId=${apiParams.userId}`
)

// Include in request body for POST/PUT requests
const panel = await apiCall('/api/panels', {
  method: 'POST',
  body: JSON.stringify({
    name: 'Panel Name',
    ...apiParams
  })
})
\`\`\`

## API Documentation

### Swagger/OpenAPI
The API includes Swagger documentation available at:
\`\`\`
http://localhost:3001/docs
\`\`\`

This provides interactive documentation where you can test endpoints directly.

## Best Practices

### Request Validation
- All requests are validated using Zod schemas
- Include required fields: `tenantId` and `userId`
- Use appropriate data types for each field

### Performance
- The API uses FastifyJS for high performance
- Database operations use MikroORM for type safety
- Responses include only necessary data fields

### Security  
- Multi-tenant isolation at the API level
- All operations require tenant and user context
- Data access is restricted by tenant boundaries

## Troubleshooting

### Common Issues

**Q: 404 errors when calling endpoints**
- Verify the API server is running on the correct port
- Check that endpoints match the exact URL patterns
- Ensure you're using the correct HTTP method

**Q: 403 Forbidden errors** 
- Verify tenantId and userId are correct
- Check that the user has access to the specified tenant
- Ensure you're including tenant context in all requests

**Q: 400 Bad Request errors**
- Check request body matches expected schema
- Verify all required fields are included
- Ensure data types match the API expectations

**Q: Panel/View not found**
- Confirm the resource exists for the specified tenant
- Check that IDs are correct and numeric where expected
- Verify user has access to the resource

## Next Steps

- **[Panel entity reference](../../reference/entities/panel.md)** - Understand the data model
- **[API client usage](./use-api-client.md)** - Use the built-in client functions
- **[Frontend integration](./frontend-integration.md)** - Connect with React components

## Related Topics

- **[Understanding multi-tenancy](../../explanation/architecture/multi-tenancy.md)** - Learn about tenant isolation
- **[Database schema](../../reference/entities/)** - Explore the data structure
- **[Authentication setup](../admin/configure-auth.md)** - Set up user authentication
