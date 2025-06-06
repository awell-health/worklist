# Panels API Reference

The `panelsAPI` provides comprehensive panel management functionality including CRUD operations, data source management, and column configuration.

## Import

\`\`\`typescript
import { panelsAPI } from '@panels/app/api'
\`\`\`

## Panel Operations

### `panelsAPI.get()`

Retrieves a specific panel by ID.

**Type Signature:**
\`\`\`typescript
get(panel: IdParam, options?: RequestOptions): Promise<PanelResponse>
\`\`\`

**Parameters:**
- `panel.id` (number): Panel identifier
- `options` (optional): Additional request options

**Returns:** `Promise<PanelResponse>`

**Example:**
\`\`\`typescript
const panel = await panelsAPI.get({ id: 123 })
console.log(panel.name) // "User Management Panel"
\`\`\`

### `panelsAPI.all()`

Lists all panels for a tenant and user.

**Type Signature:**
\`\`\`typescript
all(tenantId: string, userId: string, options?: RequestOptions): Promise<PanelsResponse>
\`\`\`

**Parameters:**
- `tenantId` (string): Tenant identifier  
- `userId` (string): User identifier
- `options` (optional): Additional request options

**Returns:** `Promise<PanelsResponse>` - Array of panels

**Example:**
\`\`\`typescript
const panels = await panelsAPI.all("tenant-123", "user-456")
panels.forEach(panel => console.log(panel.name))
\`\`\`

### `panelsAPI.create()`

Creates a new panel.

**Type Signature:**
\`\`\`typescript
create(panel: PanelInfo, options?: RequestOptions): Promise<CreatePanelResponse>
\`\`\`

**Parameters:**
- `panel.name` (string): Panel display name
- `panel.description` (string, optional): Panel description
- `panel.tenantId` (string): Tenant identifier
- `panel.userId` (string): User identifier
- `options` (optional): Additional request options

**Returns:** `Promise<CreatePanelResponse>`

**Example:**
\`\`\`typescript
const panel = await panelsAPI.create({
  name: "User Management Panel",
  description: "Manage user accounts and permissions",
  tenantId: "tenant-123",
  userId: "user-456"
})
\`\`\`

### `panelsAPI.update()`

Updates an existing panel.

**Type Signature:**
\`\`\`typescript
update(panel: PanelInfo & IdParam, options?: RequestOptions): Promise<PanelResponse>
\`\`\`

**Parameters:**
- `panel.id` (number): Panel identifier
- `panel.name` (string): Panel display name
- `panel.description` (string, optional): Panel description
- `panel.tenantId` (string): Tenant identifier
- `panel.userId` (string): User identifier
- `options` (optional): Additional request options

**Returns:** `Promise<PanelResponse>`

**Example:**
\`\`\`typescript
const updatedPanel = await panelsAPI.update({
  id: 123,
  name: "Updated Panel Name",
  description: "New description",
  tenantId: "tenant-123",
  userId: "user-456"
})
\`\`\`

### `panelsAPI.delete()`

Deletes a panel.

**Type Signature:**
\`\`\`typescript
delete(panel: IdParam & { tenantId: string; userId: string }, options?: RequestOptions): Promise<void>
\`\`\`

**Parameters:**
- `panel.id` (number): Panel identifier
- `panel.tenantId` (string): Tenant identifier
- `panel.userId` (string): User identifier
- `options` (optional): Additional request options

**Returns:** `Promise<void>`

**Example:**
\`\`\`typescript
await panelsAPI.delete({
  id: 123,
  tenantId: "tenant-123",
  userId: "user-456"
})
\`\`\`

## Data Source Operations

### `panelsAPI.dataSources.list()`

Lists all data sources for a panel.

**Type Signature:**
\`\`\`typescript
dataSources.list(panelId: string, tenantId: string, userId: string, options?: RequestOptions): Promise<DataSourcesResponse>
\`\`\`

**Example:**
\`\`\`typescript
const dataSources = await panelsAPI.dataSources.list("123", "tenant-123", "user-456")
\`\`\`

### `panelsAPI.dataSources.create()`

Adds a data source to a panel.

**Type Signature:**
\`\`\`typescript
dataSources.create(panelId: string, dataSource: DataSourceInfo, options?: RequestOptions): Promise<DataSourceResponse>
\`\`\`

**Parameters:**
- `dataSource.type`: `"database" | "api" | "file" | "custom"`
- `dataSource.config`: Configuration object specific to the data source type
- `dataSource.tenantId`: Tenant identifier
- `dataSource.userId`: User identifier

**Example:**
\`\`\`typescript
const dataSource = await panelsAPI.dataSources.create("123", {
  type: "database",
  config: {
    connectionString: "postgresql://...",
    tableName: "users"
  },
  tenantId: "tenant-123",
  userId: "user-456"
})
\`\`\`

### `panelsAPI.dataSources.update()`

Updates a data source configuration.

**Type Signature:**
\`\`\`typescript
dataSources.update(dataSourceId: string, dataSource: DataSourceInfo, options?: RequestOptions): Promise<DataSourceResponse>
\`\`\`

**Example:**
\`\`\`typescript
const updatedDataSource = await panelsAPI.dataSources.update("456", {
  type: "database",
  config: { tableName: "active_users" },
  tenantId: "tenant-123",
  userId: "user-456"
})
\`\`\`

### `panelsAPI.dataSources.delete()`

Removes a data source from a panel.

**Type Signature:**
\`\`\`typescript
dataSources.delete(dataSourceId: string, context: { tenantId: string; userId: string }, options?: RequestOptions): Promise<void>
\`\`\`

**Example:**
\`\`\`typescript
await panelsAPI.dataSources.delete("456", {
  tenantId: "tenant-123",
  userId: "user-456"
})
\`\`\`

### `panelsAPI.dataSources.sync()`

Synchronizes a data source to fetch latest data.

**Type Signature:**
\`\`\`typescript
dataSources.sync(dataSourceId: string, options?: RequestOptions): Promise<DataSourceSyncResponse>
\`\`\`

**Example:**
\`\`\`typescript
const syncResult = await panelsAPI.dataSources.sync("456")
console.log(syncResult.syncStatus) // "success" | "error"
\`\`\`

## Column Operations

### `panelsAPI.columns.list()`

Lists all columns (base and calculated) for a panel.

**Type Signature:**
\`\`\`typescript
columns.list(panelId: string, tenantId: string, userId: string, options?: RequestOptions): Promise<ColumnsResponse>
\`\`\`

**Returns:** Object with `baseColumns` and `calculatedColumns` arrays

**Example:**
\`\`\`typescript
const { baseColumns, calculatedColumns } = await panelsAPI.columns.list("123", "tenant-123", "user-456")
\`\`\`

### `panelsAPI.columns.createBase()`

Creates a base column from a data source field.

**Type Signature:**
\`\`\`typescript
columns.createBase(panelId: string, column: ColumnBaseCreate, options?: RequestOptions): Promise<ColumnBaseCreateResponse>
\`\`\`

**Parameters:**
- `column.name`: Column display name
- `column.type`: Column data type (`"text" | "number" | "date" | "boolean"` etc.)
- `column.sourceField`: Field name in the data source
- `column.dataSourceId`: Data source identifier
- `column.properties`: Column properties (validation, display, etc.)

**Example:**
\`\`\`typescript
const emailColumn = await panelsAPI.columns.createBase("123", {
  name: "Email Address",
  type: "text",
  sourceField: "email",
  dataSourceId: 456,
  properties: {
    required: true,
    validation: { pattern: "^[^@]+@[^@]+\.[^@]+$" }
  },
  tenantId: "tenant-123",
  userId: "user-456"
})
\`\`\`

### `panelsAPI.columns.createCalculated()`

Creates a calculated column with a formula.

**Type Signature:**
\`\`\`typescript
columns.createCalculated(panelId: string, column: ColumnCalculatedCreate, options?: RequestOptions): Promise<ColumnCalculatedCreateResponse>
\`\`\`

**Parameters:**
- `column.name`: Column display name
- `column.type`: Result data type
- `column.formula`: Calculation formula
- `column.dependencies`: Array of column names used in the formula

**Example:**
\`\`\`typescript
const fullNameColumn = await panelsAPI.columns.createCalculated("123", {
  name: "Full Name",
  type: "text", 
  formula: "CONCAT(first_name, ' ', last_name)",
  dependencies: ["first_name", "last_name"],
  properties: {},
  tenantId: "tenant-123",
  userId: "user-456"
})
\`\`\`

### `panelsAPI.columns.update()`

Updates column properties.

**Type Signature:**
\`\`\`typescript
columns.update(columnId: string, column: ColumnInfo, options?: RequestOptions): Promise<ColumnInfoResponse>
\`\`\`

**Example:**
\`\`\`typescript
const updatedColumn = await panelsAPI.columns.update("789", {
  name: "Updated Column Name",
  properties: { required: false },
  tenantId: "tenant-123",
  userId: "user-456"
})
\`\`\`

### `panelsAPI.columns.delete()`

Deletes a column from a panel.

**Type Signature:**
\`\`\`typescript
columns.delete(columnId: string, context: { tenantId: string; userId: string }, options?: RequestOptions): Promise<void>
\`\`\`

**Example:**
\`\`\`typescript
await panelsAPI.columns.delete("789", {
  tenantId: "tenant-123", 
  userId: "user-456"
})
\`\`\`

## Error Handling

All API methods return promises and should be wrapped in try-catch blocks:

\`\`\`typescript
try {
  const panel = await panelsAPI.create({
    name: "My Panel",
    tenantId: "tenant-123",
    userId: "user-456"
  })
} catch (error) {
  console.error("Failed to create panel:", error)
}
\`\`\`

## Related

- [Views API Reference](./views-api.md)
- [TypeScript Types](./types.md)
- [Error Handling Guide](/guides/api-client/handling-errors.md)
