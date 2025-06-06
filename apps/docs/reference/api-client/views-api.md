# Views API Reference

The `viewsAPI` provides comprehensive view management functionality including CRUD operations, publishing capabilities, and sorting configuration.

## Import

\`\`\`typescript
import { viewsAPI } from '@panels/app/api'
\`\`\`

## View Operations

### `viewsAPI.get()`

Retrieves a specific view by ID.

**Type Signature:**
\`\`\`typescript
get(view: IdParam, options?: RequestOptions): Promise<ViewResponse>
\`\`\`

**Parameters:**
- `view.id` (number): View identifier
- `options` (optional): Additional request options

**Returns:** `Promise<ViewResponse>`

**Example:**
\`\`\`typescript
const view = await viewsAPI.get({ id: 456 })
console.log(view.name) // "Active Users View"
\`\`\`

### `viewsAPI.all()`

Lists all views for a tenant and user.

**Type Signature:**
\`\`\`typescript
all(tenantId: string, userId: string, options?: RequestOptions): Promise<ViewsResponse>
\`\`\`

**Parameters:**
- `tenantId` (string): Tenant identifier  
- `userId` (string): User identifier
- `options` (optional): Additional request options

**Returns:** `Promise<ViewsResponse>` - Object with views array and total count

**Example:**
\`\`\`typescript
const { views, total } = await viewsAPI.all("tenant-123", "user-456")
console.log(`Found ${total} views`)
views.forEach(view => console.log(view.name))
\`\`\`

### `viewsAPI.create()`

Creates a new view for a panel.

**Type Signature:**
\`\`\`typescript
create(view: ViewInfo, options?: RequestOptions): Promise<ViewResponse>
\`\`\`

**Parameters:**
- `view.name` (string): View display name
- `view.description` (string, optional): View description
- `view.panelId` (number): Panel identifier this view belongs to
- `view.config.columns` (string[]): Array of column names to display
- `view.config.groupBy` (string[], optional): Columns to group by
- `view.config.layout` (string, optional): View layout type
- `view.tenantId` (string): Tenant identifier
- `view.userId` (string): User identifier

**Returns:** `Promise<ViewResponse>`

**Example:**
\`\`\`typescript
const view = await viewsAPI.create({
  name: "Active Users",
  description: "View showing only active user accounts",
  panelId: 123,
  config: {
    columns: ["email", "first_name", "last_name", "status"],
    groupBy: ["status"],
    layout: "table"
  },
  tenantId: "tenant-123",
  userId: "user-456"
})
\`\`\`

### `viewsAPI.update()`

Updates an existing view.

**Type Signature:**
\`\`\`typescript
update(view: ViewInfo & IdParam, options?: RequestOptions): Promise<ViewResponse>
\`\`\`

**Parameters:**
- `view.id` (number): View identifier
- All other parameters same as `create()`

**Returns:** `Promise<ViewResponse>`

**Example:**
\`\`\`typescript
const updatedView = await viewsAPI.update({
  id: 456,
  name: "Updated View Name",
  description: "Updated description",
  panelId: 123,
  config: {
    columns: ["email", "full_name", "status"],
    layout: "card"
  },
  tenantId: "tenant-123",
  userId: "user-456"
})
\`\`\`

### `viewsAPI.delete()`

Deletes a view.

**Type Signature:**
\`\`\`typescript
delete(view: IdParam & { tenantId: string; userId: string }, options?: RequestOptions): Promise<void>
\`\`\`

**Parameters:**
- `view.id` (number): View identifier
- `view.tenantId` (string): Tenant identifier
- `view.userId` (string): User identifier
- `options` (optional): Additional request options

**Returns:** `Promise<void>`

**Example:**
\`\`\`typescript
await viewsAPI.delete({
  id: 456,
  tenantId: "tenant-123",
  userId: "user-456"
})
\`\`\`

## Publishing Operations

### `viewsAPI.publishing.publish()`

Publishes a view to make it available tenant-wide.

**Type Signature:**
\`\`\`typescript
publishing.publish(view: IdParam, context: ViewPublishInfo, options?: RequestOptions): Promise<ViewPublishResponse>
\`\`\`

**Parameters:**
- `view.id` (number): View identifier to publish
- `context.tenantId` (string): Tenant identifier
- `context.userId` (string): User identifier (becomes the publisher)
- `options` (optional): Additional request options

**Returns:** `Promise<ViewPublishResponse>` - Contains publish details

**Example:**
\`\`\`typescript
const publishResult = await viewsAPI.publishing.publish(
  { id: 456 },
  {
    tenantId: "tenant-123",
    userId: "user-456"
  }
)

console.log(publishResult.isPublished) // true
console.log(publishResult.publishedBy) // "user-456"
console.log(publishResult.publishedAt) // Date
\`\`\`

**Use Cases:**
- Share useful views with the entire team
- Create standardized reports for the organization
- Distribute pre-configured data visualizations

## Sorting Operations

### `viewsAPI.sorts.update()`

Updates the sorting configuration for a view.

**Type Signature:**
\`\`\`typescript
sorts.update(view: IdParam, sorts: ViewSortsInfo, options?: RequestOptions): Promise<ViewSortsResponse>
\`\`\`

**Parameters:**
- `view.id` (number): View identifier
- `sorts.sorts` (ViewSort[]): Array of sort configurations
  - `columnName` (string): Name of column to sort by
  - `direction` (SortDirection): `"asc"` or `"desc"`
  - `order` (number): Sort priority (1 = primary sort, 2 = secondary, etc.)
- `sorts.tenantId` (string): Tenant identifier
- `sorts.userId` (string): User identifier

**Returns:** `Promise<ViewSortsResponse>`

**Example:**
\`\`\`typescript
const sortResult = await viewsAPI.sorts.update(
  { id: 456 },
  {
    sorts: [
      { columnName: "status", direction: "asc", order: 1 },
      { columnName: "last_name", direction: "asc", order: 2 },
      { columnName: "first_name", direction: "asc", order: 3 }
    ],
    tenantId: "tenant-123",
    userId: "user-456"
  }
)
\`\`\`

### `viewsAPI.sorts.get()`

Retrieves the current sorting configuration for a view.

**Type Signature:**
\`\`\`typescript
sorts.get(view: IdParam, tenantId: string, userId: string, options?: RequestOptions): Promise<ViewSortsResponse>
\`\`\`

**Parameters:**
- `view.id` (number): View identifier
- `tenantId` (string): Tenant identifier
- `userId` (string): User identifier
- `options` (optional): Additional request options

**Returns:** `Promise<ViewSortsResponse>`

**Example:**
\`\`\`typescript
const { sorts } = await viewsAPI.sorts.get(
  { id: 456 },
  "tenant-123",
  "user-456"
)

sorts.forEach(sort => {
  console.log(`${sort.order}: ${sort.columnName} ${sort.direction}`)
})
// Output:
// 1: status asc
// 2: last_name asc
// 3: first_name asc
\`\`\`

## Complete Workflow Example

Here's a complete example showing how to create a view, configure it, and publish it:

\`\`\`typescript
// 1. Create a view
const view = await viewsAPI.create({
  name: "Team Dashboard",
  description: "Overview of team members and their status",
  panelId: 123,
  config: {
    columns: ["email", "full_name", "department", "status", "last_login"],
    layout: "table"
  },
  tenantId: "tenant-123",
  userId: "user-456"
})

// 2. Configure sorting
await viewsAPI.sorts.update(
  { id: view.id },
  {
    sorts: [
      { columnName: "department", direction: "asc", order: 1 },
      { columnName: "last_name", direction: "asc", order: 2 }
    ],
    tenantId: "tenant-123",
    userId: "user-456"
  }
)

// 3. Publish the view for team-wide access
const publishResult = await viewsAPI.publishing.publish(
  { id: view.id },
  {
    tenantId: "tenant-123",
    userId: "user-456"
  }
)

console.log("View published successfully!", publishResult.publishedAt)
\`\`\`

## View Configuration

Views support several configuration options through the `config` object:

### Columns
\`\`\`typescript
config: {
  columns: ["email", "first_name", "last_name"] // Visible columns
}
\`\`\`

### Grouping
\`\`\`typescript
config: {
  columns: ["department", "email", "status"],
  groupBy: ["department"] // Group rows by department
}
\`\`\`

### Layout
\`\`\`typescript
config: {
  columns: ["email", "name", "avatar"],
  layout: "card" // "table" | "card" | "kanban"
}
\`\`\`

## Error Handling

All API methods return promises and should be wrapped in try-catch blocks:

\`\`\`typescript
try {
  const view = await viewsAPI.create({
    name: "My View",
    panelId: 123,
    config: { columns: ["email"] },
    tenantId: "tenant-123",
    userId: "user-456"
  })
} catch (error) {
  console.error("Failed to create view:", error)
}
\`\`\`

## Related

- [Panels API Reference](./panels-api.md)
- [TypeScript Types](./types.md)
- [View Publishing Guide](/guides/views/sharing-workflows.md)
- [Advanced Filtering Guide](/guides/views/advanced-filtering.md)
