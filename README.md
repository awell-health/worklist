# Panels Project

This project provides a comprehensive Panel Management System for healthcare applications, featuring dynamic data visualization, multi-tenant architecture, and configurable data sources.

## Overview

The Panels system allows organizations to:

- Create configurable data panels with dynamic columns from multiple data sources
- Build user-specific views with filtering, sorting, and publishing capabilities
- Manage base columns (from data sources) and calculated columns (formula-based)
- Track changes and notify users of panel modifications
- Support multi-tenant environments with proper data isolation

## Architecture

### Core Entities

- **Panels**: Configurable data containers with base and calculated columns
- **Data Sources**: External data connections (databases, APIs, files)
- **Views**: User-specific filtered visualizations of panels
- **Columns**: Base columns (from data sources) and calculated columns (formulas)
- **Change Tracking**: Panel modification history and user notifications

### Key Features

- **Multi-tenant Support**: Tenant-level and user-level panel management
- **Dynamic Data Sources**: Support for various data source types with synchronization
- **Calculated Columns**: Formula-based columns with dependency tracking
- **View Publishing**: Share personal views tenant-wide
- **Change Management**: Track panel changes and notify affected view users
- **Cohort Rules**: Define population criteria for panels

## Tech Stack

### Backend (Services)

- **Runtime**: Node.js 22.14.0
- **Framework**: Fastify 5.3.2 with TypeScript
- **ORM**: MikroORM 6.4.16 with PostgreSQL driver
- **Validation**: Zod 3.25.51 with fastify-type-provider-zod
- **Authentication**: @fastify/jwt and @fastify/auth
- **API Documentation**: @fastify/swagger and @fastify/swagger-ui
- **Testing**: Vitest 3.2.1
- **Code Quality**: Biome 1.9.4

### Frontend (App)

- **Framework**: Next.js 15.3.3 with React 19
- **Styling**: Tailwind CSS 4.1.7 with DaisyUI 5.0.43
- **Authentication**: NextAuth 5.0.0-beta.25
- **Healthcare**: Medplum Core 4.1.6 with FHIR types
- **Drag & Drop**: @dnd-kit suite
- **AI Integration**: OpenAI 4.103.0
- **Testing**: Vitest with React Testing Library

### Infrastructure

- **Database**: PostgreSQL 16
- **Cache**: Redis 7
- **Package Manager**: pnpm 10.11.0
- **Development**: Docker Compose for infrastructure
- **Build System**: Turbo with TypeScript 5.8.3

## Prerequisites

- Node.js >= 22
- pnpm >= 10.11.0
- Docker and Docker Compose
- PostgreSQL 16 (if running locally)
- Redis 7 (if running locally)

## Project Structure

```
.
├── apps/
│   ├── app/                    # Next.js frontend application
│   └── services/               # Fastify backend API
│       └── src/modules/        # API modules
│           ├── panel/          # Panel management routes
│           ├── datasource/     # Data source management
│           ├── column/         # Column management (base & calculated)
│           ├── view/           # User views and publishing
│           └── change/         # Change tracking and notifications
├── packages/                   # Shared packages
│   └── types/                  # Shared TypeScript types
├── dev/                        # Development configuration
│   ├── config/                 # Configuration files
│   └── datastore/             # Local database storage
└── compose.yaml               # Docker Compose configuration
```

## API Modules

### Panel Management

- **GET** `/panels` - List user/tenant panels
- **POST** `/panels` - Create new panel
- **GET** `/panels/:id` - Get panel details
- **PUT** `/panels/:id` - Update panel
- **DELETE** `/panels/:id` - Delete panel

### Data Source Management

- **GET** `/panels/:panelId/datasources` - List panel data sources
- **POST** `/panels/:panelId/datasources` - Add data source
- **PUT** `/datasources/:id` - Update data source
- **DELETE** `/datasources/:id` - Remove data source
- **POST** `/datasources/:id/sync` - Sync data source

### Column Management

- **GET** `/panels/:panelId/columns` - List panel columns
- **POST** `/panels/:panelId/columns/base` - Create base column
- **POST** `/panels/:panelId/columns/calculated` - Create calculated column
- **PUT** `/columns/:id` - Update column
- **DELETE** `/columns/:id` - Delete column

### View Management

- **GET** `/panels/:panelId/views` - List user views
- **POST** `/panels/:panelId/views` - Create view
- **GET** `/views/:id` - Get view details
- **PUT** `/views/:id` - Update view
- **DELETE** `/views/:id` - Delete view
- **POST** `/views/:id/publish` - Publish view tenant-wide

## Getting Started

1. **Install Dependencies**

   ```bash
   pnpm bootstrap
   ```

2. **Start Development Environment**

   ```bash
   # Start the infrastructure (PostgreSQL, Redis)
   pnpm run:infra

   # Start the development servers
   pnpm dev
   ```

3. **Access the Applications**
   - Frontend: http://localhost:3003
   - Backend API: http://localhost:3001
   - API Documentation: http://localhost:3001/docs
   - Database UI (pgweb): http://localhost:8081

## Database Setup

The services use MikroORM for database management:

```bash
# Create a new migration
pnpm --filter @panels/services migration:create

# Apply migrations
pnpm --filter @panels/services migration:apply

# Reset database with fresh schema
pnpm --filter @panels/services schema:fresh
```

## API Testing

The project includes a comprehensive Bruno collection for API testing with all endpoints covered. The collection provides:

- Complete test coverage for all Panel, Data Source, Column, and View operations
- Environment configuration for local development
- Sequential test execution workflow
- Realistic test data examples

📋 **[View the complete Bruno API Test Collection](dev/api-tests/README.md)**

## Development Tools

- **Biome**: Used for code formatting and linting

  ```bash
  pnpm format     # Check formatting
  pnpm format:fix # Fix formatting issues
  pnpm lint       # Run linter
  pnpm lint:fix   # Fix linting issues
  ```

- **TypeScript**: Type checking

  ```bash
  pnpm typecheck
  ```

- **Testing**:
  ```bash
  pnpm test                    # Run all tests
  pnpm --filter @panels/services test:coverage  # Test with coverage
  ```

## Available Scripts

- `pnpm dev`: Start development servers
- `pnpm build`: Build all applications
- `pnpm clean`: Clean build artifacts
- `pnpm clean:all`: Clean all artifacts including datastore
- `pnpm run:infra`: Start infrastructure services
- `pnpm run:infra:stop`: Stop infrastructure services
- `pnpm format`: Check code formatting
- `pnpm format:fix`: Fix code formatting
- `pnpm lint`: Run linter
- `pnpm lint:fix`: Fix linting issues
- `pnpm typecheck`: Run TypeScript type checking
- `pnpm test`: Run tests

## Infrastructure

The project uses Docker Compose to manage the following services:

- **PostgreSQL**: Database server

  - Port: 5432
  - Default credentials: medplum/medplum

- **Redis**: Cache server

  - Port: 6379
  - Password: medplum

- **pgweb**: Database management UI
  - Port: 8081

## Contributing

1. Install pre-commit hooks:

   ```bash
   pnpm prepare
   ```

2. Use conventional commits:
   ```bash
   pnpm commit
   ```

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.
