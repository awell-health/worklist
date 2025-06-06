# Schema Reference

Complete reference for all data structures, types, and interfaces used in the Panels Management System.

## Overview

This reference documents all the TypeScript interfaces, types, and schemas used throughout the Panels system. All schemas are defined in the `@panels/types` package and are used consistently across the frontend, backend, and API client.

## Core Entity Schemas

### Panel Schema

\`\`\`typescript
interface Panel {
  id: string                    // Unique panel identifier (UUID)
  title: string                 // Panel display name
  description?: string          // Optional panel description
  tenantId: string             // Organization/workspace identifier
  userId: string               // Panel owner/creator
  createdAt: Date              // Creation timestamp
  updatedAt: Date              // Last modification timestamp
  deletedAt?: Date             // Soft deletion timestamp
  metadata?: PanelMetadata     // Additional panel configuration
}

interface PanelMetadata {
  tags?: string[]              // Categorization tags
  isPublic?: boolean          // Public access flag
  settings?: PanelSettings    // Panel-specific settings
}

interface PanelSettings {
  theme?: 'light' | 'dark' | 'auto'
  refreshInterval?: number     // Auto-refresh interval (seconds)
  enableExport?: boolean      // Allow data export
  enableComments?: boolean    // Enable user comments
}
\`\`\`

### Data Source Schema

\`\`\`typescript
interface DataSource {
  id: number                   // Auto-incrementing ID
  panelId: string             // Parent panel ID
  type: DataSourceType        // Data source type
  config: DataSourceConfig    // Type-specific configuration
  lastSyncAt?: Date           // Last successful sync
  nextSyncAt?: Date           // Next scheduled sync
  syncStatus?: SyncStatus     // Current sync status
  errorMessage?: string       // Last error message
  tenantId: string            // Tenant context
  userId: string              // Creator/owner
  createdAt: Date
  updatedAt: Date
}

type DataSourceType = 
  | 'database'
  | 'api' 
  | 'file'
  | 'webhook'
  | 'csv'
  | 'json'
  | 'excel'

type SyncStatus = 
  | 'pending'
  | 'syncing'
  | 'success'
  | 'error'
  | 'cancelled'

// Union type for all data source configurations
type DataSourceConfig = 
  | DatabaseConfig
  | APIConfig
  | FileConfig
  | WebhookConfig
\`\`\`

### Column Schema

\`\`\`typescript
interface Column {
  id: number                   // Auto-incrementing ID
  panelId: string             // Parent panel ID
  title: string               // Column display name
  type: ColumnType            // Base or calculated
  dataType: DataType          // Data type for values
  sourceField?: string        // Source field (base columns only)
  formula?: string            // Formula expression (calculated columns only)
  dependencies?: string[]     // Column dependencies (calculated columns)
  displaySettings: DisplaySettings
  validation?: ValidationRules
  selectOptions?: SelectOption[]  // Options for select type
  tenantId: string
  userId: string
  createdAt: Date
  updatedAt: Date
  order?: number              // Display order
}

type ColumnType = 'base' | 'calculated'

type DataType = 
  | 'text'
  | 'number'
  | 'email'
  | 'url'
  | 'datetime'
  | 'boolean'
  | 'select'
  | 'json'
  | 'currency'
  | 'percentage'

interface DisplaySettings {
  width?: number              // Column width in pixels
  alignment?: 'left' | 'center' | 'right'
  sortable?: boolean          // Enable sorting
  filterable?: boolean        // Enable filtering
  visible?: boolean           // Show/hide column
  order?: number              // Display order
  frozen?: boolean            // Freeze column position
  
  // Text formatting
  placeholder?: string        // Input placeholder
  maxLength?: number          // Character limit
  multiline?: boolean         // Multi-line text
  
  // Number formatting
  numberFormat?: string       // Number format pattern
  decimalPlaces?: number      // Decimal precision
  prefix?: string             // Display prefix (e.g., "$")
  suffix?: string             // Display suffix (e.g., "%")
  thousandsSeparator?: string // Thousands separator
  
  // Date/time formatting
  dateFormat?: string         // Date format pattern
  timeFormat?: string         // Time format pattern
  timezone?: string           // Timezone for display
  
  // Boolean display
  trueLabel?: string          // Label for true values
  falseLabel?: string         // Label for false values
  
  // Link settings
  linkText?: string           // Display text for URLs
  openInNewTab?: boolean      // Link behavior
  
  // Style customization
  backgroundColor?: string    // Background color
  textColor?: string          // Text color
  fontWeight?: 'normal' | 'bold'
  fontSize?: number           // Font size
}

interface ValidationRules {
  required?: boolean          // Field is required
  minLength?: number          // Minimum text length
  maxLength?: number          // Maximum text length
  pattern?: string            // Regex pattern
  min?: number                // Minimum numeric value
  max?: number                // Maximum numeric value
  customValidation?: string   // Custom validation formula
  errorMessage?: string       // Custom error message
}

interface SelectOption {
  value: string               // Option value
  label: string               // Display label
  color?: string              // Display color
  icon?: string               // Option icon
  description?: string        // Option description
}
\`\`\`

### View Schema

\`\`\`typescript
interface View {
  id: number                  // Auto-incrementing ID
  panelId: string            // Parent panel ID
  title: string              // View display name
  description?: string       // View description
  filters: FilterCriteria[]  // Filter configuration
  sorting: SortCriteria[]    // Sort configuration
  columnVisibility: Record<string, boolean>  // Column visibility map
  groupBy?: string[]         // Grouping columns
  aggregations?: Aggregation[]  // Aggregate functions
  isPublished?: boolean      // Published status
  publishConfig?: PublishConfig  // Publishing configuration
  tenantId: string
  userId: string
  createdAt: Date
  updatedAt: Date
  accessedAt?: Date          // Last access timestamp
}

interface FilterCriteria {
  columnTitle: string        // Target column
  operator: FilterOperator   // Filter operation
  value: any                 // Filter value
  logicalOperator?: 'AND' | 'OR'  // Logical connector
  conditions?: FilterCriteria[]   // Nested conditions
}

type FilterOperator = 
  | 'equals'
  | 'notEquals'
  | 'contains'
  | 'notContains'
  | 'startsWith'
  | 'endsWith'
  | 'greaterThan'
  | 'lessThan'
  | 'greaterThanOrEqual'
  | 'lessThanOrEqual'
  | 'between'
  | 'notBetween'
  | 'in'
  | 'notIn'
  | 'isNull'
  | 'isNotNull'
  | 'isEmpty'
  | 'isNotEmpty'

interface SortCriteria {
  columnTitle: string        // Target column
  direction: 'asc' | 'desc'  // Sort direction
  priority?: number          // Sort priority (for multiple sorts)
  nullsFirst?: boolean       // Null value positioning
  customOrder?: string[]     // Custom sort order for select fields
}

interface Aggregation {
  columnTitle: string        // Target column
  function: AggregationFunction  // Aggregate function
  alias?: string             // Result column alias
}

type AggregationFunction = 
  | 'count'
  | 'sum'
  | 'average'
  | 'min'
  | 'max'
  | 'median'
  | 'distinct'

interface PublishConfig {
  publishedTitle?: string    // Public title
  description?: string       // Public description
  permissions: Permission[]  // Access permissions
  userGroups: string[]       // Allowed user groups
  isDefault?: boolean        // Default view flag
  expiresAt?: Date          // Expiration date
  passwordProtected?: boolean // Password protection
  allowDownload?: boolean    // Download permission
  allowComments?: boolean    // Comments permission
}

type Permission = 'read' | 'edit' | 'create' | 'delete' | 'manage'
\`\`\`

## Data Source Configuration Schemas

### Database Configuration

\`\`\`typescript
interface DatabaseConfig {
  connectionString: string   // Database connection URL
  schema?: string           // Database schema (default: public)
  table?: string            // Specific table to query
  query?: string            // Custom SQL query
  
  // Connection settings
  poolSize?: number         // Connection pool size
  timeout?: number          // Query timeout (milliseconds)
  sslMode?: 'require' | 'prefer' | 'disable'
  
  // Sync settings
  incrementalColumn?: string  // Column for incremental sync
  lastSyncValue?: any        // Last synced value
  batchSize?: number         // Records per batch
  
  // Authentication
  username?: string          // Database username
  password?: string          // Database password
  authType?: 'password' | 'certificate' | 'iam'
}
\`\`\`

### API Configuration

\`\`\`typescript
interface APIConfig {
  apiEndpoint: string        // API URL
  method: 'GET' | 'POST' | 'PUT' | 'PATCH'
  headers?: Record<string, string>  // Request headers
  body?: any                 // Request body (for POST/PUT)
  
  // Authentication
  authentication?: APIAuthentication
  
  // Response processing
  responseFormat?: 'json' | 'xml' | 'csv'
  dataPath?: string          // JSONPath to data array
  
  // Scheduling
  schedule?: string          // Cron expression
  timezone?: string          // Schedule timezone
  
  // Request settings
  timeout?: number           // Request timeout (ms)
  retryAttempts?: number     // Retry count
  retryDelay?: number        // Retry delay (ms)
  
  // Pagination
  paginationStyle?: 'offset' | 'cursor' | 'page'
  pageSize?: number          // Items per page
  maxPages?: number          // Maximum pages to fetch
}

interface APIAuthentication {
  type: 'bearer' | 'basic' | 'api-key' | 'oauth2'
  
  // Bearer token
  token?: string
  
  // Basic auth
  username?: string
  password?: string
  
  // API key
  apiKey?: string
  apiKeyHeader?: string      // Header name for API key
  
  // OAuth2
  clientId?: string
  clientSecret?: string
  tokenUrl?: string
  scope?: string
}
\`\`\`

### File Configuration

\`\`\`typescript
interface FileConfig {
  filePath: string           // File path or URL
  format: FileFormat         // File format
  
  // CSV-specific
  hasHeaders?: boolean       // CSV has header row
  delimiter?: string         // CSV delimiter
  quoteChar?: string         // Quote character
  escapeChar?: string        // Escape character
  encoding?: string          // File encoding
  
  // Excel-specific
  sheetName?: string         // Excel sheet name
  sheetIndex?: number        // Excel sheet index
  
  // JSON-specific
  jsonPath?: string          // JSONPath to data
  
  // Processing options
  skipRows?: number          // Rows to skip
  maxRows?: number           // Maximum rows to process
  
  // Upload settings
  allowedExtensions?: string[]  // Allowed file extensions
  maxFileSize?: number       // Maximum file size (bytes)
}

type FileFormat = 'csv' | 'json' | 'excel' | 'tsv' | 'xml'
\`\`\`

### Webhook Configuration

\`\`\`typescript
interface WebhookConfig {
  endpoint: string           // Webhook endpoint URL
  secret?: string            // Webhook secret for verification
  events: WebhookEvent[]     // Events to trigger webhook
  
  // Security
  verifySignature?: boolean  // Verify webhook signature
  signatureHeader?: string   // Signature header name
  
  // Processing
  dataPath?: string          // JSONPath to extract data
  batchEvents?: boolean      // Batch multiple events
  
  // Retry settings
  retryAttempts?: number     // Retry count
  retryDelay?: number        // Retry delay (ms)
}

type WebhookEvent = 
  | 'data.created'
  | 'data.updated' 
  | 'data.deleted'
  | 'sync.started'
  | 'sync.completed'
  | 'sync.failed'
\`\`\`

## Request/Response Schemas

### API Request Parameters

\`\`\`typescript
interface ListParams {
  page?: number              // Page number (1-based)
  limit?: number             // Items per page (max 100)
  sort?: string              // Sort field
  order?: 'asc' | 'desc'     // Sort direction
  search?: string            // Search query
  searchFields?: string[]    // Fields to search
  filters?: Record<string, any>  // Filter parameters
}

interface IdParam {
  id: string | number        // Resource identifier
}

interface TenantUserParams {
  tenantId: string           // Tenant identifier
  userId: string             // User identifier
}
\`\`\`

### API Response Schemas

\`\`\`typescript
interface APIResponse<T> {
  data: T                    // Response data
  meta?: ResponseMeta        // Optional metadata
  links?: ResponseLinks      // Pagination links
}

interface ResponseMeta {
  total?: number             // Total item count
  page?: number              // Current page
  limit?: number             // Items per page
  pages?: number             // Total pages
  hasNext?: boolean          // Has next page
  hasPrev?: boolean          // Has previous page
}

interface ResponseLinks {
  first?: string             // First page URL
  prev?: string              // Previous page URL
  next?: string              // Next page URL
  last?: string              // Last page URL
}

interface APIError {
  error: string              // Error message
  code: string               // Error code
  details?: any              // Additional error details
  timestamp: string          // ISO timestamp
  requestId?: string         // Request identifier
}
\`\`\`

## Validation Schemas

### Zod Validation Examples

\`\`\`typescript
import { z } from 'zod'

// Panel validation schema
const PanelSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  tenantId: z.string().uuid(),
  userId: z.string().uuid()
})

// Column validation schema
const ColumnSchema = z.object({
  title: z.string().min(1).max(100),
  type: z.enum(['base', 'calculated']),
  dataType: z.enum(['text', 'number', 'email', 'url', 'datetime', 'boolean', 'select', 'json']),
  sourceField: z.string().optional(),
  formula: z.string().optional(),
  dependencies: z.array(z.string()).optional(),
  displaySettings: z.object({
    width: z.number().min(50).max(1000).optional(),
    alignment: z.enum(['left', 'center', 'right']).optional(),
    sortable: z.boolean().optional(),
    filterable: z.boolean().optional()
  }),
  validation: z.object({
    required: z.boolean().optional(),
    minLength: z.number().min(0).optional(),
    maxLength: z.number().min(1).optional(),
    pattern: z.string().optional()
  }).optional()
})

// Data source validation schema
const DataSourceSchema = z.object({
  type: z.enum(['database', 'api', 'file', 'webhook']),
  config: z.union([
    DatabaseConfigSchema,
    APIConfigSchema,
    FileConfigSchema,
    WebhookConfigSchema
  ])
})
\`\`\`

## Formula and Expression Schemas

### Formula Functions

\`\`\`typescript
interface FormulaFunction {
  name: string               // Function name
  category: FunctionCategory // Function category
  description: string        // Function description
  syntax: string            // Function syntax
  parameters: FormulaParameter[]  // Function parameters
  returnType: DataType      // Return data type
  examples: FormulaExample[] // Usage examples
}

type FunctionCategory = 
  | 'text'
  | 'math'
  | 'date'
  | 'logical'
  | 'lookup'
  | 'statistical'
  | 'conversion'

interface FormulaParameter {
  name: string              // Parameter name
  type: DataType            // Parameter type
  required: boolean         // Required parameter
  description: string       // Parameter description
}

interface FormulaExample {
  expression: string        // Formula expression
  description: string       // Example description
  result: any              // Expected result
}
\`\`\`

### Expression Validation

\`\`\`typescript
interface ExpressionContext {
  availableColumns: Column[]  // Available column references
  functions: FormulaFunction[]  // Available functions
  constants: Record<string, any>  // Available constants
}

interface ExpressionError {
  type: 'syntax' | 'reference' | 'type' | 'circular'
  message: string           // Error message
  position?: number         // Character position
  suggestion?: string       // Suggested fix
}
\`\`\`

## Event and Change Tracking Schemas

### Change Events

\`\`\`typescript
interface ChangeEvent {
  id: string                // Event ID
  entityType: EntityType    // Changed entity type
  entityId: string | number // Entity identifier
  action: ChangeAction      // Type of change
  changes: Record<string, ChangeValue>  // Field changes
  metadata: ChangeMetadata  // Additional context
  tenantId: string
  userId: string
  timestamp: Date
}

type EntityType = 'panel' | 'dataSource' | 'column' | 'view'
type ChangeAction = 'created' | 'updated' | 'deleted' | 'published'

interface ChangeValue {
  oldValue?: any            // Previous value
  newValue?: any            // New value
}

interface ChangeMetadata {
  userAgent?: string        // User agent
  ipAddress?: string        // IP address
  sessionId?: string        // Session identifier
  source?: 'web' | 'api' | 'system'  // Change source
}
\`\`\`

## Export/Import Schemas

### Export Configuration

\`\`\`typescript
interface ExportConfig {
  format: ExportFormat      // Export format
  includeData?: boolean     // Include data or just structure
  includeFormulas?: boolean // Include calculated columns
  dateRange?: DateRange     // Date range for data
  maxRows?: number          // Maximum rows to export
  compression?: boolean     // Compress output
}

type ExportFormat = 'csv' | 'excel' | 'json' | 'pdf'

interface DateRange {
  start: Date               // Start date
  end: Date                 // End date
  column?: string           // Date column to filter on
}
\`\`\`

### Import Configuration

\`\`\`typescript
interface ImportConfig {
  format: ImportFormat      // Import format
  mapping: FieldMapping[]   // Field mappings
  options: ImportOptions    // Import options
  validation: ImportValidation  // Validation rules
}

type ImportFormat = 'csv' | 'excel' | 'json'

interface FieldMapping {
  sourceField: string       // Source field name
  targetColumn: string      // Target column name
  transformation?: string   // Data transformation formula
}

interface ImportOptions {
  hasHeaders?: boolean      // File has headers
  skipRows?: number         // Rows to skip
  createColumns?: boolean   // Auto-create missing columns
  updateExisting?: boolean  // Update existing records
  batchSize?: number        // Import batch size
}

interface ImportValidation {
  allowedFormats?: string[] // Allowed file formats
  maxFileSize?: number      // Maximum file size
  requiredFields?: string[] // Required fields
  uniqueFields?: string[]   // Fields that must be unique
}
\`\`\`

## Type Utilities

### Common Type Utilities

\`\`\`typescript
// Utility types for working with schemas
type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
type Required<T, K extends keyof T> = T & Required<Pick<T, K>>

// Entity creation types (without generated fields)
type CreatePanel = Optional<Panel, 'id' | 'createdAt' | 'updatedAt'>
type CreateColumn = Optional<Column, 'id' | 'createdAt' | 'updatedAt'>
type CreateView = Optional<View, 'id' | 'createdAt' | 'updatedAt'>

// Entity update types (partial with some required fields)
type UpdatePanel = Partial<Panel> & { id: string }
type UpdateColumn = Partial<Column> & { id: number }
type UpdateView = Partial<View> & { id: number }

// API parameter types
type PanelParams = TenantUserParams
type DataSourceParams = TenantUserParams & { panelId: string }
type ColumnParams = TenantUserParams & { panelId: string }
type ViewParams = TenantUserParams & { panelId: string }
\`\`\`

## Schema Versioning

### Version Management

\`\`\`typescript
interface SchemaVersion {
  version: string           // Schema version (semver)
  description: string       // Version description
  changes: SchemaChange[]   // List of changes
  deprecated?: string[]     // Deprecated fields
  breaking?: boolean        // Breaking changes flag
  releaseDate: Date
}

interface SchemaChange {
  type: 'added' | 'modified' | 'removed' | 'deprecated'
  entity: string            // Entity name
  field?: string            // Field name
  description: string       // Change description
}
\`\`\`

## Further Reading

- **[Data Types Reference](./data-types.md)** - Detailed data type documentation
- **[Column Types Reference](./column-types.md)** - Column-specific schemas
- **[Formula Functions Reference](./formula-functions.md)** - All available formula functions
- **[Validation Rules Reference](./validation-rules.md)** - Complete validation documentation
- **[API Reference](../api/index.md)** - API endpoint documentation
