# Data Model

This document explains the data model and entity relationships that form the foundation of the Panels Management System. Understanding these relationships is crucial for effective use of the system.

## Entity Overview

The Panels system is built around several core entities that work together to provide flexible data management:

\`\`\`
Panel (Core Entity)
├── CohortRule (1:1)
├── DataSources (1:N)
├── BaseColumns (1:N)
├── CalculatedColumns (1:N)
├── Views (1:N)
└── PanelChanges (1:N)

View (Presentation Entity)
├── ViewSorts (1:N)
├── ViewFilters (1:N)
└── ViewNotifications (1:N)
\`\`\`

## Core Entities

### Panel Entity

The **Panel** is the central organizing entity that represents a collection of related data and configuration.

\`\`\`typescript
interface Panel {
  id: number                    // Unique identifier
  name: string                  // Human-readable name
  description?: string          // Optional description
  tenantId: string             // Multi-tenant isolation
  userId: string               // Panel owner
  cohortRule: CohortRule       // Population definition
  createdAt: Date              // Creation timestamp
  updatedAt: Date              // Last modification
}
\`\`\`

**Purpose**: Panels serve as containers that organize related data sources, columns, and views. They define the scope and context for data management operations.

**Key Characteristics**:
- **Ownership**: Each panel belongs to a specific user within a tenant
- **Isolation**: Complete separation between tenants
- **Flexibility**: Can contain multiple data sources and unlimited views
- **Metadata**: Rich metadata for organization and discovery

### CohortRule Entity

The **CohortRule** defines the population or subset of data that a panel operates on.

\`\`\`typescript
interface CohortRule {
  id: number                    // Unique identifier
  conditions: Condition[]       // Filter conditions
  logic: 'AND' | 'OR'          // Logical operator
  panel: Panel                 // Parent panel (1:1)
}

interface Condition {
  field: string                // Field to filter on
  operator: string             // Comparison operator
  value: any                   // Filter value
}
\`\`\`

**Purpose**: CohortRules allow panels to operate on specific subsets of data rather than entire datasets.

**Use Cases**:
- **Patient Panels**: Only active patients
- **Sales Panels**: Current quarter data
- **User Panels**: Specific user roles
- **Regional Panels**: Geographic restrictions

### DataSource Entity

**DataSources** connect panels to external data systems and define how data flows into the panel.

\`\`\`typescript
interface DataSource {
  id: number                    // Unique identifier
  type: DataSourceType         // Source type (database, api, file)
  config: DataSourceConfig     // Connection configuration
  lastSyncAt?: Date            // Last synchronization timestamp
  panel: Panel                 // Parent panel
  tenantId: string             // Tenant isolation
  userId: string               // Owner
}

type DataSourceType = 'database' | 'api' | 'file' | 'webhook'

interface DataSourceConfig {
  // Configuration varies by type
  connectionString?: string     // For database sources
  apiEndpoint?: string         // For API sources
  filePath?: string            // For file sources
  headers?: Record<string, string> // For API authentication
  schedule?: string            // Sync schedule (cron format)
}
\`\`\`

**Purpose**: DataSources abstract the complexity of connecting to different data systems and provide a uniform interface for data access.

**Supported Types**:
- **Database**: PostgreSQL, MySQL, SQLite connections
- **API**: REST API endpoints with authentication
- **File**: CSV, JSON, Excel file imports
- **Webhook**: Real-time data push from external systems

## Column System

The column system provides flexible data structure definition with two distinct types:

### BaseColumn Entity

**BaseColumns** represent direct mappings to fields in data sources.

\`\`\`typescript
interface BaseColumn {
  id: number                    // Unique identifier
  name: string                  // Display name
  type: ColumnType             // Data type
  sourceField: string          // Source field mapping
  properties: ColumnProperties // Type-specific properties
  panel: Panel                 // Parent panel
  dataSource: DataSource       // Source of data
  tenantId: string             // Tenant isolation
  userId: string               // Owner
}

type ColumnType = 'text' | 'number' | 'date' | 'boolean' | 'email' | 'url'

interface ColumnProperties {
  required?: boolean           // Field validation
  format?: string             // Display format
  defaultValue?: any          // Default value
  validation?: ValidationRule[] // Custom validation
}
\`\`\`

**Purpose**: BaseColumns provide the foundational data structure by mapping to actual fields in connected data sources.

**Characteristics**:
- **Direct Mapping**: One-to-one relationship with source fields
- **Type Safety**: Enforced data types with validation
- **Transformation**: Basic formatting and validation rules
- **Metadata**: Rich metadata for display and interaction

### CalculatedColumn Entity

**CalculatedColumns** represent computed fields based on formulas and dependencies.

\`\`\`typescript
interface CalculatedColumn {
  id: number                    // Unique identifier
  name: string                  // Display name
  formula: string              // Calculation formula
  dependencies: string[]       // Required column names
  type: ColumnType             // Result data type
  panel: Panel                 // Parent panel
  tenantId: string             // Tenant isolation
  userId: string               // Owner
}
\`\`\`

**Purpose**: CalculatedColumns enable complex data transformations and computations without modifying source data.

**Formula Examples**:
\`\`\`javascript
// Simple arithmetic
"baseColumn1 + baseColumn2"

// Conditional logic
"if(status === 'active', 1, 0)"

// Date calculations
"daysBetween(startDate, endDate)"

// Aggregations (within panel context)
"sum(revenue) / count(customers)"
\`\`\`

**Dependencies**: The system automatically tracks dependencies and updates calculated columns when their dependent columns change.

## View System

Views provide customized presentations of panel data for different users and use cases.

### View Entity

**Views** define how data is presented, filtered, and sorted for specific purposes.

\`\`\`typescript
interface View {
  id: number                    // Unique identifier
  name: string                  // Display name
  description?: string          // Optional description
  config: ViewConfig           // View configuration
  isPublished: boolean         // Sharing status
  panel: Panel                 // Parent panel
  tenantId: string             // Tenant isolation
  userId: string               // View creator
}

interface ViewConfig {
  columns: string[]            // Included column names
  filters: ViewFilter[]        // Applied filters
  sorts: ViewSort[]            // Sort configuration
  pagination: PaginationConfig // Page size, etc.
  grouping?: GroupingConfig    // Grouping rules
}
\`\`\`

**Purpose**: Views allow multiple users to have different perspectives on the same underlying data without duplicating or modifying the source.

### ViewSort Entity

**ViewSorts** define how data is ordered within views.

\`\`\`typescript
interface ViewSort {
  id: number                    // Unique identifier
  columnName: string           // Column to sort by
  direction: 'ASC' | 'DESC'    // Sort direction
  priority: number             // Sort order (for multi-column sorts)
  view: View                   // Parent view
}
\`\`\`

**Multi-level Sorting**: Views support multiple sort criteria with explicit priority ordering.

### ViewFilter Entity

**ViewFilters** define how data is filtered within views.

\`\`\`typescript
interface ViewFilter {
  id: number                    // Unique identifier
  columnName: string           // Column to filter
  operator: FilterOperator     // Comparison operator
  value: any                   // Filter value
  logic: 'AND' | 'OR'         // Logical operator
  view: View                   // Parent view
}

type FilterOperator = 
  | 'equals' | 'not_equals'
  | 'greater_than' | 'less_than'
  | 'contains' | 'starts_with' | 'ends_with'
  | 'in' | 'not_in'
  | 'is_null' | 'is_not_null'
\`\`\`

**Advanced Filtering**: Supports complex filter combinations with nested logical operators.

## Change Tracking System

The system maintains comprehensive audit trails for all modifications.

### PanelChange Entity

**PanelChanges** track all modifications to panel-level entities.

\`\`\`typescript
interface PanelChange {
  id: number                    // Unique identifier
  entityType: string           // Changed entity type
  entityId: number             // Changed entity ID
  action: ChangeAction         // Type of change
  previousValue?: any          // Before state
  newValue?: any               // After state
  metadata: ChangeMetadata     // Additional context
  panel: Panel                 // Parent panel
  tenantId: string             // Tenant isolation
  userId: string               // User who made change
  createdAt: Date              // Change timestamp
}

type ChangeAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'PUBLISH' | 'SYNC'

interface ChangeMetadata {
  source: string               // Change source (ui, api, system)
  reason?: string              // Optional reason
  impactedUsers?: string[]     // Users affected by change
}
\`\`\`

**Purpose**: Change tracking enables auditing, rollback capabilities, and impact analysis.

### ViewNotification Entity

**ViewNotifications** manage alerts for view-related changes.

\`\`\`typescript
interface ViewNotification {
  id: number                    // Unique identifier
  type: NotificationType       // Notification type
  message: string              // Notification content
  isRead: boolean              // Read status
  view: View                   // Related view
  userId: string               // Recipient user
  createdAt: Date              // Notification timestamp
}

type NotificationType = 'VIEW_PUBLISHED' | 'VIEW_UPDATED' | 'DATA_CHANGED'
\`\`\`

## Data Relationships

### Primary Relationships

\`\`\`
Panel (1) ←→ (1) CohortRule
Panel (1) ←→ (N) DataSource
Panel (1) ←→ (N) BaseColumn
Panel (1) ←→ (N) CalculatedColumn
Panel (1) ←→ (N) View
Panel (1) ←→ (N) PanelChange

DataSource (1) ←→ (N) BaseColumn

View (1) ←→ (N) ViewSort
View (1) ←→ (N) ViewFilter
View (1) ←→ (N) ViewNotification
\`\`\`

### Dependency Graph

\`\`\`mermaid
graph TD
    Panel --> CohortRule
    Panel --> DataSource
    Panel --> BaseColumn
    Panel --> CalculatedColumn
    Panel --> View
    Panel --> PanelChange
    
    DataSource --> BaseColumn
    BaseColumn --> CalculatedColumn
    
    View --> ViewSort
    View --> ViewFilter
    View --> ViewNotification
    
    CalculatedColumn -.-> BaseColumn
    CalculatedColumn -.-> CalculatedColumn
\`\`\`

## Multi-tenant Data Isolation

### Tenant Boundaries

Every entity includes `tenantId` for complete data isolation:

\`\`\`typescript
// Example query with tenant isolation
const panels = await em.find(Panel, {
  tenantId: currentTenant.id,
  userId: currentUser.id
})
\`\`\`

### Access Control Matrix

| Entity | Tenant Isolation | User Ownership | Cross-User Access |
|--------|------------------|----------------|-------------------|
| Panel | ✅ Required | ✅ Required | ❌ Not allowed |
| DataSource | ✅ Required | ✅ Required | ❌ Not allowed |
| BaseColumn | ✅ Required | ✅ Required | ❌ Not allowed |
| CalculatedColumn | ✅ Required | ✅ Required | ❌ Not allowed |
| View | ✅ Required | ✅ Required | ✅ If published |
| PanelChange | ✅ Required | ✅ Required | ✅ Read-only audit |

## Data Integrity

### Constraints

**Foreign Key Constraints**:
- All child entities must reference valid parent entities
- Cascade deletes ensure referential integrity
- Orphaned records are automatically cleaned up

**Validation Rules**:
- Panel names must be unique within tenant/user scope
- Column names must be unique within panel scope
- View names must be unique within panel scope
- Data source configurations must be valid for their type

**Business Rules**:
- Published views cannot be deleted (must be unpublished first)
- Calculated columns cannot create circular dependencies
- Data source synchronization maintains data consistency

### Transactions

All multi-entity operations use database transactions:

\`\`\`typescript
// Example: Creating panel with default entities
await em.transactional(async (em) => {
  const panel = new Panel(...)
  const cohortRule = new CohortRule(...)
  const change = new PanelChange(...)
  
  await em.persistAndFlush([panel, cohortRule, change])
})
\`\`\`

## Performance Considerations

### Indexing Strategy

**Primary Indexes**:
- `panels(tenant_id, user_id)` - User panel listing
- `datasources(panel_id)` - Panel data source lookup
- `base_columns(panel_id)` - Panel column listing
- `views(panel_id, user_id)` - User view listing

**Query Optimization**:
- Eager loading for frequently accessed relationships
- Pagination for large result sets
- Caching for read-heavy operations
- Connection pooling for database efficiency

### Scalability Patterns

**Horizontal Scaling**:
- Tenant-based sharding potential
- Read replicas for query scaling
- Microservice decomposition ready

**Data Growth Management**:
- Archival strategies for historical data
- Partitioning for large change tracking tables
- Cleanup jobs for expired notifications

## Related Documentation

- [System Overview](./system-overview.md) - High-level architecture
- [Multi-tenancy](./multi-tenancy.md) - Tenant isolation details
- [Security Model](./security-model.md) - Security considerations
- [Database Schema](/reference/database/schema.md) - Technical schema reference
