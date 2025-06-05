# Introduction to Awell Panels

Welcome to the comprehensive documentation for the **Awell Panels Management System** - a powerful platform for creating dynamic data panels with configurable columns, user-specific views, and multi-tenant architecture.

## What is Panels?

The Panels system allows organizations to:
- 🔧 **Create configurable data panels** with dynamic columns from multiple data sources
- 👀 **Build user-specific views** with filtering, sorting, and publishing capabilities  
- 📊 **Manage base columns** (from data sources) and calculated columns (formula-based)
- 🔄 **Track changes** and notify users of panel modifications
- 🏢 **Support multi-tenant** environments with proper data isolation

## Quick Navigation

### 📚 [Getting Started](/getting-started/)
**New to Panels?** Start here with our step-by-step tutorial to create your first panel, add data sources, and build views.

### 🛠️ [How-to Guides](/guides/)
**Need to solve a specific problem?** Find practical guides for common tasks and advanced patterns.

### 📖 [API Reference](/reference/)
**Looking for detailed API information?** Complete reference documentation for the API client and backend endpoints.

### 🧠 [Understanding](/explanation/)
**Want to understand how it works?** Deep dives into architecture, concepts, and design decisions.

### 🏗️ [Projects](/projects/)
**Working with the monorepo?** Documentation for each project in the workspace.

### 💡 [Examples](/examples/)
**Learn by example?** Code samples and practical implementation patterns.

## Technology Stack

- **Frontend**: Next.js 15.3.3 with React 19, Tailwind CSS, DaisyUI
- **Backend**: Fastify 5.3.2 with TypeScript, MikroORM 6.4.16  
- **Database**: PostgreSQL 16 with Redis 7 caching
- **API Client**: Type-safe client with Zod validation
- **Testing**: Vitest with comprehensive Bruno API collection

## Key Features

### Multi-tenant Architecture
Complete tenant isolation with user-level and tenant-level access controls.

### Dynamic Data Sources  
Connect to databases, APIs, files, and custom sources with real-time synchronization.

### Calculated Columns
Formula-based columns with dependency tracking and validation.

### View Publishing
Share personal views tenant-wide with proper permission management.

### Change Management
Track panel modifications and notify affected users automatically.

## Quick Start

```typescript
import { panelsAPI, viewsAPI } from '@panels/app/api'

// Create a panel
const panel = await panelsAPI.create({
  name: "User Management Panel",
  tenantId: "tenant-123", 
  userId: "user-456"
})

// Add a data source
const dataSource = await panelsAPI.dataSources.create(panel.id, {
  type: "database",
  config: { connectionString: "..." }
})

// Create a view  
const view = await viewsAPI.create({
  name: "Active Users",
  panelId: panel.id,
  config: { columns: ["email", "status"] }
})
```

[Get started with the tutorial →](/getting-started/)

## Need Help?

- 🐛 **Found a bug?** Check our [troubleshooting guide](/guides/api-client/handling-errors)
- 🤔 **Have a question?** Browse our [how-to guides](/guides/)
- 📚 **Want to contribute?** See our [contributing guide](/projects/docs/contributing)

