# Creating a Panel - Complete Example

This example shows how to create a complete panel with data sources, columns, and views using the enhanced API client.

## Overview

We'll create a **User Management Panel** that demonstrates all key features:
- Panel creation with proper metadata
- Database data source connection
- Base columns from the data source
- Calculated columns with formulas
- Multiple views for different user roles

## Step 1: Create the Panel

\`\`\`typescript
import { panelsAPI } from '@panels/app/api'

// Create the main panel
const panel = await panelsAPI.create({
  name: "User Management Panel",
  description: "Comprehensive user account management and analytics",
  tenantId: "tenant-123",
  userId: "admin-456"
})

console.log(`Panel created with ID: ${panel.id}`)
\`\`\`

## Step 2: Add a Data Source

\`\`\`typescript
// Connect to the users database
const dataSource = await panelsAPI.dataSources.create(panel.id.toString(), {
  type: "database",
  config: {
    connectionString: "postgresql://localhost:5432/users_db",
    tableName: "users",
    primaryKey: "id"
  },
  tenantId: "tenant-123", 
  userId: "admin-456"
})

console.log(`Data source created with ID: ${dataSource.id}`)
\`\`\`

## Step 3: Create Base Columns

\`\`\`typescript
// Email column with validation
const emailColumn = await panelsAPI.columns.createBase(panel.id.toString(), {
  name: "Email Address",
  type: "text",
  sourceField: "email",
  dataSourceId: dataSource.id,
  properties: {
    required: true,
    unique: true,
    validation: {
      pattern: "^[^@]+@[^@]+\\.[^@]+$"
    },
    display: {
      width: 250,
      visible: true
    }
  },
  tenantId: "tenant-123",
  userId: "admin-456"
})

// First name column
const firstNameColumn = await panelsAPI.columns.createBase(panel.id.toString(), {
  name: "First Name",
  type: "text", 
  sourceField: "first_name",
  dataSourceId: dataSource.id,
  properties: {
    required: true,
    display: { width: 150 }
  },
  tenantId: "tenant-123",
  userId: "admin-456"
})

// Last name column
const lastNameColumn = await panelsAPI.columns.createBase(panel.id.toString(), {
  name: "Last Name",
  type: "text",
  sourceField: "last_name", 
  dataSourceId: dataSource.id,
  properties: {
    required: true,
    display: { width: 150 }
  },
  tenantId: "tenant-123",
  userId: "admin-456"
})

// Account status column
const statusColumn = await panelsAPI.columns.createBase(panel.id.toString(), {
  name: "Account Status",
  type: "select",
  sourceField: "status",
  dataSourceId: dataSource.id,
  properties: {
    required: true,
    validation: {
      options: ["active", "inactive", "pending", "suspended"]
    },
    display: { width: 120 }
  },
  tenantId: "tenant-123",
  userId: "admin-456"
})

// Created date column
const createdAtColumn = await panelsAPI.columns.createBase(panel.id.toString(), {
  name: "Created Date",
  type: "date",
  sourceField: "created_at",
  dataSourceId: dataSource.id,
  properties: {
    display: {
      width: 120,
      format: "MM/dd/yyyy"
    }
  },
  tenantId: "tenant-123",
  userId: "admin-456"
})
\`\`\`

## Step 4: Create Calculated Columns

\`\`\`typescript
// Full name calculated column
const fullNameColumn = await panelsAPI.columns.createCalculated(panel.id.toString(), {
  name: "Full Name",
  type: "text",
  formula: "CONCAT(first_name, ' ', last_name)",
  dependencies: ["first_name", "last_name"],
  properties: {
    display: {
      width: 200,
      visible: true
    }
  },
  tenantId: "tenant-123",
  userId: "admin-456"
})

// Account age calculated column  
const accountAgeColumn = await panelsAPI.columns.createCalculated(panel.id.toString(), {
  name: "Account Age (Days)",
  type: "number",
  formula: "DATEDIFF(NOW(), created_at)",
  dependencies: ["created_at"],
  properties: {
    display: {
      width: 140,
      format: "0"
    }
  },
  tenantId: "tenant-123",
  userId: "admin-456"
})

// Status badge calculated column
const statusBadgeColumn = await panelsAPI.columns.createCalculated(panel.id.toString(), {
  name: "Status Badge",
  type: "text",
  formula: `
    CASE status 
      WHEN 'active' THEN '🟢 Active'
      WHEN 'inactive' THEN '⚫ Inactive' 
      WHEN 'pending' THEN '🟡 Pending'
      WHEN 'suspended' THEN '🔴 Suspended'
      ELSE '❓ Unknown'
    END
  `,
  dependencies: ["status"],
  properties: {
    display: { width: 120 }
  },
  tenantId: "tenant-123",
  userId: "admin-456"
})
\`\`\`

## Step 5: Create Views

### Admin View (All Columns)

\`\`\`typescript
import { viewsAPI } from '@panels/app/api'

const adminView = await viewsAPI.create({
  name: "Admin Dashboard",
  description: "Complete user management view for administrators",
  panelId: panel.id,
  config: {
    columns: [
      "email",
      "full_name", 
      "first_name",
      "last_name",
      "status_badge",
      "account_age_days",
      "created_date"
    ],
    groupBy: ["status"],
    layout: "table"
  },
  tenantId: "tenant-123",
  userId: "admin-456"
})

// Configure admin view sorting
await viewsAPI.sorts.update(
  { id: adminView.id },
  {
    sorts: [
      { columnName: "status", direction: "asc", order: 1 },
      { columnName: "last_name", direction: "asc", order: 2 },
      { columnName: "first_name", direction: "asc", order: 3 }
    ],
    tenantId: "tenant-123",
    userId: "admin-456"
  }
)
\`\`\`

### User Directory View (Public Information)

\`\`\`typescript
const directoryView = await viewsAPI.create({
  name: "User Directory",
  description: "Public directory of active users",
  panelId: panel.id,
  config: {
    columns: [
      "full_name",
      "email", 
      "status_badge"
    ],
    layout: "card"
  },
  tenantId: "tenant-123",
  userId: "admin-456"
})

// Publish the directory view for tenant-wide access
const publishResult = await viewsAPI.publishing.publish(
  { id: directoryView.id },
  {
    tenantId: "tenant-123",
    userId: "admin-456"
  }
)

console.log(`Directory view published at: ${publishResult.publishedAt}`)
\`\`\`

### Active Users View (Filtered)

\`\`\`typescript
const activeUsersView = await viewsAPI.create({
  name: "Active Users Only",
  description: "View showing only users with active status",
  panelId: panel.id,
  config: {
    columns: [
      "full_name",
      "email",
      "account_age_days",
      "created_date"
    ],
    layout: "table"
  },
  tenantId: "tenant-123",
  userId: "admin-456"
})

// Configure sorting for active users
await viewsAPI.sorts.update(
  { id: activeUsersView.id },
  {
    sorts: [
      { columnName: "account_age_days", direction: "desc", order: 1 },
      { columnName: "full_name", direction: "asc", order: 2 }
    ],
    tenantId: "tenant-123",
    userId: "admin-456"
  }
)

// Publish active users view
await viewsAPI.publishing.publish(
  { id: activeUsersView.id },
  {
    tenantId: "tenant-123",
    userId: "admin-456"
  }
)
\`\`\`

## Step 6: Verify the Setup

\`\`\`typescript
// List all panel columns to verify
const { baseColumns, calculatedColumns } = await panelsAPI.columns.list(
  panel.id.toString(),
  "tenant-123", 
  "admin-456"
)

console.log(`Created ${baseColumns.length} base columns:`)
baseColumns.forEach(col => console.log(`  - ${col.name} (${col.type})`))

console.log(`Created ${calculatedColumns.length} calculated columns:`)
calculatedColumns.forEach(col => console.log(`  - ${col.name} (${col.type})`))

// List all views
const { views, total } = await viewsAPI.all("tenant-123", "admin-456")
console.log(`Created ${total} views:`)
views.forEach(view => {
  const publishStatus = view.isPublished ? "📤 Published" : "🔒 Private"
  console.log(`  - ${view.name} (${publishStatus})`)
})
\`\`\`

## Complete Workflow Function

Here's the complete workflow wrapped in a reusable function:

\`\`\`typescript
async function createUserManagementPanel(tenantId: string, userId: string) {
  try {
    // 1. Create panel
    const panel = await panelsAPI.create({
      name: "User Management Panel",
      description: "Comprehensive user account management and analytics",
      tenantId,
      userId
    })

    // 2. Add data source
    const dataSource = await panelsAPI.dataSources.create(panel.id.toString(), {
      type: "database",
      config: {
        connectionString: process.env.DATABASE_URL,
        tableName: "users"
      },
      tenantId,
      userId
    })

    // 3. Create base columns
    const columns = await Promise.all([
      panelsAPI.columns.createBase(panel.id.toString(), {
        name: "Email", type: "text", sourceField: "email",
        dataSourceId: dataSource.id, properties: { required: true },
        tenantId, userId
      }),
      panelsAPI.columns.createBase(panel.id.toString(), {
        name: "First Name", type: "text", sourceField: "first_name",
        dataSourceId: dataSource.id, properties: { required: true },
        tenantId, userId
      }),
      panelsAPI.columns.createBase(panel.id.toString(), {
        name: "Last Name", type: "text", sourceField: "last_name", 
        dataSourceId: dataSource.id, properties: { required: true },
        tenantId, userId
      }),
      panelsAPI.columns.createBase(panel.id.toString(), {
        name: "Status", type: "select", sourceField: "status",
        dataSourceId: dataSource.id, properties: { required: true },
        tenantId, userId
      })
    ])

    // 4. Create calculated columns
    await panelsAPI.columns.createCalculated(panel.id.toString(), {
      name: "Full Name", type: "text",
      formula: "CONCAT(first_name, ' ', last_name)",
      dependencies: ["first_name", "last_name"],
      properties: {}, tenantId, userId
    })

    // 5. Create and publish views
    const directoryView = await viewsAPI.create({
      name: "User Directory", panelId: panel.id,
      config: { columns: ["full_name", "email", "status"] },
      tenantId, userId
    })

    await viewsAPI.publishing.publish({ id: directoryView.id }, { tenantId, userId })

    return {
      panel,
      dataSource,
      columns,
      views: [directoryView]
    }
  } catch (error) {
    console.error("Failed to create user management panel:", error)
    throw error
  }
}

// Usage
const result = await createUserManagementPanel("tenant-123", "admin-456")
console.log("Panel setup complete!", result.panel.id)
\`\`\`

## Next Steps

- 📊 [Learn about advanced formulas](../advanced-patterns/formula-examples.md)
- 🔍 [Set up complex filters](../advanced-patterns/filter-combinations.md)
- ⚡ [Optimize performance](../../guides/panels/performance-tips.md)
- 🧪 [Test your implementation](../code-samples/testing.md)
