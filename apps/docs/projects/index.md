# Monorepo Overview

The Awell Panels project is organized as a monorepo using pnpm workspaces, containing multiple applications and shared packages that work together to provide the complete Panels Management System.

## Project Structure

\`\`\`
worklist/
├── apps/                      # Applications
│   ├── app/                   # Next.js frontend application
│   ├── services/              # Fastify backend API
│   └── docs/                  # VitePress documentation site
├── packages/                  # Shared packages
│   └── types/                 # Shared TypeScript types and schemas
├── dev/                       # Development configuration
│   ├── config/               # Configuration files
│   └── datastore/            # Local database storage
├── compose.yaml              # Docker Compose for infrastructure
├── package.json              # Root package configuration
├── pnpm-workspace.yaml       # pnpm workspace configuration
└── turbo.json               # Turbo build configuration
\`\`\`

## Applications

### Frontend Application (`apps/app/`)

**Purpose**: User-facing web application for the Panels Management System

**Technology Stack**:
- **Framework**: Next.js 15.3.3 with React 19
- **Styling**: Tailwind CSS 4.1.7 with DaisyUI 5.0.43
- **Authentication**: NextAuth 5.0.0-beta.25
- **State Management**: React hooks and context
- **API Integration**: Type-safe API client
- **Testing**: Vitest with React Testing Library

**Key Features**:
- Server-side rendering for performance
- Responsive design with modern UI components
- Real-time updates and interactions
- Comprehensive form handling and validation
- Drag-and-drop interfaces for data management

[→ View App Documentation](./app/)

### Backend Services (`apps/services/`)

**Purpose**: RESTful API server providing all backend functionality

**Technology Stack**:
- **Framework**: Fastify 5.3.2 with TypeScript
- **Database**: MikroORM 6.4.16 with PostgreSQL driver
- **Validation**: Zod 3.25.51 with fastify-type-provider-zod
- **Authentication**: JWT with @fastify/jwt and @fastify/auth
- **Documentation**: Auto-generated with @fastify/swagger
- **Testing**: Vitest 3.2.1
- **Code Quality**: Biome 1.9.4

**Key Features**:
- RESTful API with OpenAPI documentation
- Multi-tenant data isolation
- Real-time synchronization capabilities
- Comprehensive validation and error handling
- Database migrations and seeding

[→ View Services Documentation](./services/)

### Documentation Site (`apps/docs/`)

**Purpose**: Comprehensive documentation using the Diataxis framework

**Technology Stack**:
- **Framework**: VitePress (latest)
- **Structure**: Diataxis (Tutorial, How-to, Reference, Explanation)
- **Search**: Local search with full-text indexing
- **Deployment**: Static site generation

**Content Organization**:
- **Tutorial**: Step-by-step learning materials
- **How-to Guides**: Problem-solving documentation
- **Reference**: API documentation and technical specs
- **Explanation**: Architecture and design decisions

[→ View Docs Documentation](./docs/)

## Shared Packages

### Types Package (`packages/types/`)

**Purpose**: Shared TypeScript types and Zod schemas across the monorepo

**Features**:
- **Zod Schemas**: Runtime validation and type generation
- **TypeScript Types**: Shared interfaces and type definitions
- **Multi-format Export**: CommonJS and ESM support
- **Tree-shaking**: Optimized for bundle size

**Exported Modules**:
- `@panels/types/panels` - Panel-related types
- `@panels/types/views` - View-related types
- `@panels/types/columns` - Column-related types
- `@panels/types/datasources` - Data source types
- `@panels/types/changes` - Change tracking types

[→ View Types Documentation](./types/)

## Development Infrastructure

### Package Management

**pnpm Workspaces**: Efficient dependency management with workspace linking

\`\`\`yaml
# pnpm-workspace.yaml
packages:
  - "apps/*"
  - "packages/*"
\`\`\`

**Benefits**:
- Shared dependencies across packages
- Fast installation and linking
- Consistent version management
- Reduced disk usage

### Build System

**Turbo**: High-performance build system for monorepos

\`\`\`json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "test": {
      "dependsOn": ["^build"]
    },
    "lint": {},
    "typecheck": {}
  }
}
\`\`\`

**Benefits**:
- Parallel execution of tasks
- Intelligent caching
- Dependency-aware builds
- Incremental builds

### Development Environment

**Docker Compose**: Containerized infrastructure services

\`\`\`yaml
# compose.yaml
services:
  postgresql:   # Database server
  redis:        # Cache and session store
  pgweb:        # Database management UI
\`\`\`

**Benefits**:
- Consistent development environment
- Easy setup and teardown
- Isolated services
- Production parity

## Workspace Scripts

### Global Scripts

Available from the root directory:

\`\`\`bash
# Development
pnpm dev                    # Start all applications
pnpm build                  # Build all packages
pnpm test                   # Run all tests

# Infrastructure
pnpm run:infra             # Start Docker services
pnpm run:infra:stop        # Stop Docker services

# Code Quality
pnpm lint                  # Lint all packages
pnpm format                # Format all code
pnpm typecheck             # Type check all packages

# Maintenance
pnpm clean                 # Clean build artifacts
pnpm clean:all             # Clean everything including data
\`\`\`

### Package-Specific Scripts

\`\`\`bash
# Frontend development
pnpm --filter @panels/app dev
pnpm --filter @panels/app build

# Backend development
pnpm --filter @panels/services dev
pnpm --filter @panels/services test:coverage

# Documentation
pnpm --filter @panels/docs dev
pnpm --filter @panels/docs build

# Types package
pnpm --filter @panels/types build
pnpm --filter @panels/types typecheck
\`\`\`

## Inter-Package Dependencies

### Dependency Graph

\`\`\`
@panels/app
├── @panels/types (workspace:^)
└── External dependencies

@panels/services  
├── @panels/types (workspace:^)
└── External dependencies

@panels/docs
└── External dependencies (VitePress, etc.)

@panels/types
└── External dependencies (Zod, etc.)
\`\`\`

### Workspace Benefits

- **Type Safety**: Shared types ensure consistency across frontend and backend
- **Schema Validation**: Shared Zod schemas for runtime validation
- **Development Speed**: Hot reloading works across package boundaries
- **Version Consistency**: Single source of truth for shared dependencies

## Development Workflow

### Setting Up

\`\`\`bash
# 1. Clone repository
git clone <repository-url>
cd worklist

# 2. Install dependencies
pnpm bootstrap

# 3. Start infrastructure
pnpm run:infra

# 4. Start development
pnpm dev
\`\`\`

### Making Changes

\`\`\`bash
# 1. Create feature branch
git checkout -b feature/my-feature

# 2. Make changes to any package
# 3. Run tests
pnpm test

# 4. Check code quality
pnpm lint
pnpm typecheck

# 5. Build everything
pnpm build

# 6. Commit and push
git add .
git commit -m "feat: add new feature"
git push origin feature/my-feature
\`\`\`

### Package-Specific Development

\`\`\`bash
# Work on frontend only
cd apps/app
pnpm dev

# Work on backend only  
cd apps/services
pnpm dev

# Work on documentation
cd apps/docs
pnpm dev

# Update shared types
cd packages/types
pnpm build
\`\`\`

## Production Deployment

### Build Process

\`\`\`bash
# 1. Install dependencies
pnpm install --frozen-lockfile

# 2. Build all packages
pnpm build

# 3. Run tests
pnpm test

# 4. Package for deployment
# (Specific to deployment target)
\`\`\`

### Container Strategy

Each application can be containerized independently:

\`\`\`dockerfile
# Example for services
FROM node:22-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod
COPY dist/ ./dist/
CMD ["node", "dist/server.js"]
\`\`\`

## Monitoring and Observability

### Development Tools

- **TypeScript**: Full type checking across all packages
- **Biome**: Consistent code formatting and linting
- **Vitest**: Fast unit and integration testing
- **Hot Reload**: Instant feedback during development

### Production Monitoring

- **Health Checks**: Built into each service
- **Logging**: Structured logging with correlation IDs
- **Metrics**: Performance and business metrics
- **Error Tracking**: Centralized error monitoring

## Contributing Guidelines

### Code Standards

- **TypeScript**: Strict mode enabled
- **Formatting**: Biome configuration
- **Testing**: Minimum 80% coverage
- **Documentation**: JSDoc for public APIs

### Commit Standards

- **Conventional Commits**: Standardized commit messages
- **Linear History**: Rebase workflow preferred
- **Package Scope**: Prefix commits with affected packages

### Review Process

- **Type Safety**: No TypeScript errors
- **Test Coverage**: All new code tested
- **Documentation**: Update docs for public changes
- **Performance**: Consider impact on bundle size

## Related Documentation

- [App Project](./app/) - Frontend application details
- [Services Project](./services/) - Backend API details
- [Types Package](./types/) - Shared types and schemas
- [Docs Project](./docs/) - Documentation site details
