# Adding Data Sources

Now that you have your first panel, it's time to connect it to real data! In this tutorial, you'll learn how to add data sources to your panel and understand how they work.

## What You'll Learn

By the end of this tutorial, you'll know how to:
- ✅ Connect different types of data sources to your panel
- ✅ Configure database connections
- ✅ Set up API data sources
- ✅ Import data from files
- ✅ Synchronize data and monitor status

## Prerequisites

- ✅ Completed [Your First Panel](./first-panel.md)
- ✅ Have a panel created and ready to use
- ✅ Development environment running

## Understanding Data Sources

**Data Sources** are the bridges that connect your panels to external data systems. Think of them as:

- 🔌 **Connectors**: Link to databases, APIs, files, or other systems
- 🔄 **Synchronizers**: Keep your panel data up-to-date
- 🎯 **Adapters**: Transform external data into a consistent format
- 🛡️ **Isolators**: Maintain security and access control

### Supported Data Source Types

| Type | Description | Use Cases |
|------|-------------|-----------|
| **Database** | Direct database connections | PostgreSQL, MySQL, SQLite |
| **API** | REST API endpoints | External services, webhooks |
| **File** | File-based imports | CSV, JSON, Excel files |
| **Webhook** | Real-time data push | Live updates, events |

## Step 1: Database Data Source

Let's start by connecting to a database - the most common data source type.

### Prepare the Connection

First, let's set up our imports and get our panel reference:

```typescript
// data-source-demo.ts
import { panelsAPI } from '@panels/app/api'

// Use your panel ID from the previous tutorial
const PANEL_ID = "123" // Replace with your actual panel ID
const TENANT_ID = "tenant-123"
const USER_ID = "user-456"

console.log("Starting data source tutorial...")
```

### Create Database Data Source

```typescript
async function createDatabaseDataSource() {
  try {
    console.log("🔌 Creating database data source...")
    
    const dataSource = await panelsAPI.dataSources.create(PANEL_ID, {
      type: "database",
      config: {
        connectionString: "postgresql://user:password@localhost:5432/sample_db",
        schema: "public",
        table: "users"
      },
      tenantId: TENANT_ID,
      userId: USER_ID
    })

    console.log("✅ Database data source created!")
    console.log(`   Data Source ID: ${dataSource.id}`)
    console.log(`   Type: ${dataSource.type}`)
    console.log(`   Last Sync: ${dataSource.lastSyncAt || 'Never'}`)
    
    return dataSource
  } catch (error) {
    console.error("❌ Failed to create database data source:", error)
    throw error
  }
}

// Create the data source
const dbDataSource = await createDatabaseDataSource()
```

### Verify Connection

Let's check that our data source was created successfully:

```typescript
async function verifyDataSource(dataSourceId: number) {
  try {
    console.log("🔍 Verifying data source...")
    
    // List all data sources for the panel
    const dataSources = await panelsAPI.dataSources.list(
      PANEL_ID,
      TENANT_ID, 
      USER_ID
    )

    console.log(`📊 Panel has ${dataSources.length} data source(s):`)
    dataSources.forEach((ds, index) => {
      console.log(`   ${index + 1}. ${ds.type} (ID: ${ds.id})`)
      console.log(`      Last Sync: ${ds.lastSyncAt?.toLocaleDateString() || 'Never'}`)
    })
    
    return dataSources
  } catch (error) {
    console.error("❌ Failed to verify data source:", error)
    throw error
  }
}

// Verify our data source
await verifyDataSource(dbDataSource.id)
```

## Step 2: API Data Source

Now let's add an API data source to demonstrate connecting to external services:

```typescript
async function createAPIDataSource() {
  try {
    console.log("🌐 Creating API data source...")
    
    const apiDataSource = await panelsAPI.dataSources.create(PANEL_ID, {
      type: "api",
      config: {
        apiEndpoint: "https://jsonplaceholder.typicode.com/users",
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "Panels-API-Client"
        },
        schedule: "0 */6 * * *" // Sync every 6 hours
      },
      tenantId: TENANT_ID,
      userId: USER_ID
    })

    console.log("✅ API data source created!")
    console.log(`   Data Source ID: ${apiDataSource.id}`)
    console.log(`   Endpoint: ${apiDataSource.config.apiEndpoint}`)
    console.log(`   Schedule: Every 6 hours`)
    
    return apiDataSource
  } catch (error) {
    console.error("❌ Failed to create API data source:", error)
    throw error
  }
}

// Create API data source
const apiDataSource = await createAPIDataSource()
```

## Step 3: File Data Source

Let's add a file-based data source for importing existing data:

```typescript
async function createFileDataSource() {
  try {
    console.log("📁 Creating file data source...")
    
    const fileDataSource = await panelsAPI.dataSources.create(PANEL_ID, {
      type: "file",
      config: {
        filePath: "/data/users.csv",
        format: "csv",
        hasHeaders: true,
        delimiter: ",",
        encoding: "utf-8"
      },
      tenantId: TENANT_ID,
      userId: USER_ID
    })

    console.log("✅ File data source created!")
    console.log(`   Data Source ID: ${fileDataSource.id}`)
    console.log(`   File: ${fileDataSource.config.filePath}`)
    console.log(`   Format: ${fileDataSource.config.format}`)
    
    return fileDataSource
  } catch (error) {
    console.error("❌ Failed to create file data source:", error)
    throw error
  }
}

// Create file data source
const fileDataSource = await createFileDataSource()
```

## Step 4: Data Synchronization

Now let's sync our data sources to pull in actual data:

```typescript
async function syncDataSources() {
  try {
    console.log("🔄 Starting data synchronization...")
    
    // Get all data sources for the panel
    const dataSources = await panelsAPI.dataSources.list(
      PANEL_ID,
      TENANT_ID, 
      USER_ID
    )

    // Sync each data source
    for (const dataSource of dataSources) {
      console.log(`   Syncing ${dataSource.type} data source (ID: ${dataSource.id})...`)
      
      await panelsAPI.dataSources.sync(
        PANEL_ID,
        dataSource.id,
        TENANT_ID,
        USER_ID
      )
      
      console.log(`   ✅ ${dataSource.type} sync completed`)
    }
    
    console.log("🎉 All data sources synchronized!")
    
  } catch (error) {
    console.error("❌ Data synchronization failed:", error)
    throw error
  }
}

// Sync all data sources
await syncDataSources()
```

## Step 5: Monitoring Sync Status

Let's check the sync status of our data sources:

```typescript
async function checkSyncStatus() {
  try {
    console.log("📊 Checking sync status...")
    
    const dataSources = await panelsAPI.dataSources.list(
      PANEL_ID,
      TENANT_ID, 
      USER_ID
    )

    console.log("📈 Data Source Status Report:")
    console.log("=" * 50)
    
    dataSources.forEach((ds) => {
      const syncAge = ds.lastSyncAt 
        ? Math.round((Date.now() - ds.lastSyncAt.getTime()) / (1000 * 60))
        : null
      
      console.log(`📁 ${ds.type.toUpperCase()} Data Source (ID: ${ds.id})`)
      console.log(`   Last Sync: ${ds.lastSyncAt?.toLocaleString() || 'Never'}`)
      if (syncAge !== null) {
        console.log(`   Sync Age: ${syncAge} minutes ago`)
      }
      console.log("")
    })
    
  } catch (error) {
    console.error("❌ Failed to check sync status:", error)
    throw error
  }
}

// Check status
await checkSyncStatus()
```

## Complete Example

Here's the complete workflow for adding and managing data sources:

```typescript
import { panelsAPI } from '@panels/app/api'

const PANEL_ID = "123" // Your panel ID
const TENANT_ID = "tenant-123"
const USER_ID = "user-456"

async function dataSourceWorkflow() {
  console.log("🚀 Starting Data Source Management Demo\n")
  
  try {
    // 1. Create multiple data sources
    console.log("1️⃣ Creating data sources...")
    
    const dbSource = await panelsAPI.dataSources.create(PANEL_ID, {
      type: "database",
      config: {
        connectionString: "postgresql://localhost:5432/sample",
        table: "users"
      },
      tenantId: TENANT_ID,
      userId: USER_ID
    })
    
    const apiSource = await panelsAPI.dataSources.create(PANEL_ID, {
      type: "api", 
      config: {
        apiEndpoint: "https://api.example.com/users",
        method: "GET"
      },
      tenantId: TENANT_ID,
      userId: USER_ID
    })
    
    console.log(`   ✅ Created ${2} data sources\n`)
    
    // 2. List all data sources
    console.log("2️⃣ Listing data sources...")
    const sources = await panelsAPI.dataSources.list(PANEL_ID, TENANT_ID, USER_ID)
    console.log(`   ✅ Found ${sources.length} data sources\n`)
    
    // 3. Sync all sources
    console.log("3️⃣ Synchronizing data...")
    for (const source of sources) {
      await panelsAPI.dataSources.sync(PANEL_ID, source.id, TENANT_ID, USER_ID)
    }
    console.log("   ✅ All sources synchronized\n")
    
    // 4. Verify sync status
    console.log("4️⃣ Checking final status...")
    const updatedSources = await panelsAPI.dataSources.list(PANEL_ID, TENANT_ID, USER_ID)
    updatedSources.forEach(source => {
      console.log(`   📊 ${source.type}: ${source.lastSyncAt ? 'Synced' : 'Pending'}`)
    })
    
    console.log("\n🎉 Data source setup completed!")
    console.log("   Next: Add columns to structure your data")
    
  } catch (error) {
    console.error("💥 Workflow failed:", error.message)
    throw error
  }
}

// Run the complete workflow
dataSourceWorkflow()
  .then(() => {
    console.log("\n🎯 Ready for the next step: Creating Columns!")
  })
  .catch(error => {
    console.error("\n💥 Setup failed:", error.message)
  })
```

## Data Source Configuration Options

### Database Configuration

```typescript
interface DatabaseConfig {
  connectionString: string     // Database connection URL
  schema?: string             // Database schema (default: public)
  table?: string              // Specific table to sync
  query?: string              // Custom SQL query
  poolSize?: number           // Connection pool size
  sslMode?: 'require' | 'prefer' | 'disable'
}
```

### API Configuration

```typescript
interface APIConfig {
  apiEndpoint: string         // API URL
  method: 'GET' | 'POST'     // HTTP method
  headers?: Record<string, string> // Request headers
  body?: any                  // Request body (for POST)
  authentication?: {          // Auth configuration
    type: 'bearer' | 'basic' | 'api-key'
    token?: string
    username?: string
    password?: string
    apiKey?: string
  }
  schedule?: string           // Cron schedule for sync
  timeout?: number            // Request timeout (ms)
}
```

### File Configuration

```typescript
interface FileConfig {
  filePath: string            // File path or URL
  format: 'csv' | 'json' | 'excel'
  hasHeaders?: boolean        // CSV has header row
  delimiter?: string          // CSV delimiter
  encoding?: string           // File encoding
  sheetName?: string          // Excel sheet name
}
```

## Common Data Source Patterns

### Production Database Connection

```typescript
const productionDB = await panelsAPI.dataSources.create(panelId, {
  type: "database",
  config: {
    connectionString: process.env.DATABASE_URL,
    schema: "analytics",
    query: "SELECT * FROM user_metrics WHERE active = true",
    poolSize: 5,
    sslMode: "require"
  },
  tenantId,
  userId
})
```

### Authenticated API

```typescript
const authenticatedAPI = await panelsAPI.dataSources.create(panelId, {
  type: "api",
  config: {
    apiEndpoint: "https://api.service.com/data",
    method: "GET",
    headers: {
      "Authorization": `Bearer ${process.env.API_TOKEN}`,
      "Content-Type": "application/json"
    },
    schedule: "0 8 * * *", // Daily at 8 AM
    timeout: 30000
  },
  tenantId,
  userId
})
```

### Excel File Import

```typescript
const excelImport = await panelsAPI.dataSources.create(panelId, {
  type: "file",
  config: {
    filePath: "/uploads/quarterly-report.xlsx",
    format: "excel",
    sheetName: "User Data",
    hasHeaders: true
  },
  tenantId,
  userId
})
```

## Troubleshooting

### Common Issues

**Database Connection Failed:**
```typescript
// Check connection string format
const validConnectionString = "postgresql://user:pass@host:port/database"

// Verify network access and credentials
// Check if database allows connections from your IP
```

**API Sync Errors:**
```typescript
// Verify API endpoint is accessible
// Check authentication credentials
// Validate request headers and format
// Review API rate limits
```

**File Not Found:**
```typescript
// Ensure file path is correct and accessible
// Verify file format matches configuration
// Check file permissions and encoding
```

### Debug Mode

Enable detailed logging for troubleshooting:

```typescript
// Add debug logging to your data source operations
const debugDataSource = async () => {
  try {
    console.log("Debug: Creating data source...")
    const result = await panelsAPI.dataSources.create(panelId, config)
    console.log("Debug: Success:", result)
    return result
  } catch (error) {
    console.error("Debug: Error details:", {
      message: error.message,
      status: error.status,
      config: config
    })
    throw error
  }
}
```

## Next Steps

Excellent! You now have data flowing into your panel. Here's what you can do next:

🎯 **Immediate Next Steps:**
- [Creating Columns →](./creating-columns.md) - Structure your data with columns
- [Building Views →](./building-views.md) - Create custom data views

🔗 **Related Guides:**
- [Multi-source Panels](/guides/panels/multi-source-panels.md) - Combining multiple data sources
- [Performance Tips](/guides/panels/performance-tips.md) - Optimizing data sync
- [API Authentication](/guides/api-client/authentication.md) - Secure API connections

🛠️ **Advanced Topics:**
- [Data Source Types](/reference/configuration/data-types.md) - Complete reference
- [Environment Configuration](/guides/deployment/environment-config.md) - Production setup
- [Bruno API Testing](/reference/bruno-collection/api-testing.md) - Testing data sources

## Summary

In this tutorial, you learned how to:

✅ **Connect Different Data Sources** - Database, API, and file connections  
✅ **Configure Source Settings** - Authentication, scheduling, and options  
✅ **Synchronize Data** - Pull data from external systems  
✅ **Monitor Sync Status** - Check data freshness and sync health  
✅ **Handle Common Issues** - Troubleshoot connection problems

Your panel now has live data! Next, we'll structure this data with columns to make it meaningful and actionable. 