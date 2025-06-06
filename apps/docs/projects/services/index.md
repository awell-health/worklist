# Backend Services (@panels/services)

The backend services provide the core API and business logic for the Panels Management System. Built with Fastify, TypeScript, and MikroORM, it delivers high-performance, type-safe REST APIs with comprehensive validation and multi-tenant support.

## Overview

**Package Name**: `@panels/services`  
**Location**: `apps/services/`  
**Framework**: Fastify 5.3.2 with TypeScript  
**Database**: PostgreSQL with MikroORM 6.4.16  
**Port**: 3001 (development)

## Technology Stack

### Core Framework
- **Fastify 5.3.2** - High-performance HTTP server
- **TypeScript 5.7.2** - Type safety and developer experience
- **Node.js 22+** - Runtime environment

### Database & ORM
- **MikroORM 6.4.16** - TypeScript-first ORM
- **PostgreSQL Driver** - Database connectivity
- **Redis** - Caching and session storage

### Validation & Documentation
- **Zod 3.25.51** - Runtime validation and type generation
- **@fastify/swagger** - Auto-generated API documentation
- **fastify-type-provider-zod** - Zod integration for Fastify

### Authentication & Security
- **@fastify/jwt** - JWT token handling
- **@fastify/auth** - Authentication hooks
- **@fastify/cors** - Cross-origin resource sharing
- **@fastify/helmet** - Security headers

## Project Structure

\`\`\`
apps/services/
├── src/
│   ├── modules/               # Feature modules
│   │   ├── panel/            # Panel management
│   │   │   ├── entities/     # Database entities
│   │   │   ├── routes/       # HTTP route handlers
│   │   │   └── services/     # Business logic
│   │   ├── view/             # View management
│   │   ├── column/           # Column management
│   │   ├── datasource/       # Data source management
│   │   └── change/           # Change tracking
│   ├── database/             # Database configuration
│   │   ├── migrations/       # Database migrations
│   │   └── seeders/          # Test data seeders
│   ├── plugins/              # Fastify plugins
│   ├── utils/                # Utility functions
│   └── app.ts               # Application entry point
├── test/                     # Test files
├── mikro-orm.config.ts      # ORM configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Package configuration
\`\`\`

## API Architecture

### REST API Design
The API follows RESTful principles with consistent patterns:

\`\`\`
GET    /api/panels                 # List panels
POST   /api/panels                 # Create panel
GET    /api/panels/:id             # Get panel
PUT    /api/panels/:id             # Update panel
DELETE /api/panels/:id             # Delete panel

GET    /api/panels/:id/datasources # List data sources
POST   /api/panels/:id/datasources # Create data source
PUT    /api/datasources/:id        # Update data source
DELETE /api/datasources/:id        # Delete data source

GET    /api/panels/:id/columns     # List columns
POST   /api/panels/:id/columns/base # Create base column
POST   /api/panels/:id/columns/calculated # Create calculated column
\`\`\`

### Module-based Organization
Each feature is organized into self-contained modules:

#### Panel Module
\`\`\`typescript
// Entity definition
@Entity()
export class Panel {
  @PrimaryKey()
  id!: number

  @Property()
  name!: string

  @Property({ nullable: true })
  description?: string

  @Property()
  tenantId!: string

  @Property()
  userId!: string

  @OneToOne()
  cohortRule!: CohortRule

  @OneToMany(() => DataSource, ds => ds.panel)
  dataSources = new Collection<DataSource>(this)

  @OneToMany(() => BaseColumn, col => col.panel)
  baseColumns = new Collection<BaseColumn>(this)
}
\`\`\`

#### Route Handlers
\`\`\`typescript
// Panel routes with Zod validation
export async function panelRoutes(fastify: FastifyInstance) {
  // Create panel
  fastify.post('/', {
    schema: {
      body: CreatePanelSchema,
      response: { 200: CreatePanelResponseSchema }
    }
  }, async (request, reply) => {
    const panel = await panelService.create(request.body)
    return reply.send(panel)
  })

  // List panels
  fastify.get('/', {
    schema: {
      querystring: ListPanelsQuerySchema,
      response: { 200: ListPanelsResponseSchema }
    }
  }, async (request, reply) => {
    const panels = await panelService.findAll(request.query)
    return reply.send(panels)
  })
}
\`\`\`

## Database Design

### Entity Relationship Model
\`\`\`
Panel (1) ←→ (N) DataSource
Panel (1) ←→ (N) BaseColumn
Panel (1) ←→ (N) CalculatedColumn
Panel (1) ←→ (N) View
Panel (1) ←→ (1) CohortRule

View (1) ←→ (N) ViewSort
View (1) ←→ (N) ViewFilter

Panel (1) ←→ (N) PanelChange
View (1) ←→ (N) ViewNotification
\`\`\`

### Core Entities

#### Panel Entity
\`\`\`typescript
@Entity()
export class Panel {
  @PrimaryKey()
  id!: number

  @Property()
  name!: string

  @Property({ nullable: true })
  description?: string

  @Property()
  tenantId!: string

  @Property()
  userId!: string

  @Property()
  createdAt = new Date()

  @Property({ onUpdate: () => new Date() })
  updatedAt = new Date()

  @OneToOne(() => CohortRule, { eager: true })
  cohortRule!: CohortRule
}
\`\`\`

#### Data Source Entity
\`\`\`typescript
@Entity()
export class DataSource {
  @PrimaryKey()
  id!: number

  @Property()
  type!: string

  @Property({ type: 'json' })
  config!: Record<string, any>

  @Property()
  lastSyncAt?: Date

  @ManyToOne(() => Panel)
  panel!: Panel

  @Property()
  tenantId!: string

  @Property()
  userId!: string
}
\`\`\`

#### Column Entities
\`\`\`typescript
@Entity()
export class BaseColumn {
  @PrimaryKey()
  id!: number

  @Property()
  name!: string

  @Property()
  type!: string

  @Property()
  sourceField!: string

  @Property({ type: 'json' })
  properties!: Record<string, any>

  @ManyToOne(() => Panel)
  panel!: Panel

  @ManyToOne(() => DataSource)
  dataSource!: DataSource
}

@Entity()
export class CalculatedColumn {
  @PrimaryKey()
  id!: number

  @Property()
  name!: string

  @Property()
  formula!: string

  @Property({ type: 'json' })
  dependencies!: string[]

  @ManyToOne(() => Panel)
  panel!: Panel
}
\`\`\`

## Business Logic Services

### Panel Service
\`\`\`typescript
export class PanelService {
  constructor(
    private readonly em: EntityManager,
    private readonly changeTracker: ChangeTrackingService
  ) {}

  async create(data: CreatePanelRequest): Promise<CreatePanelResponse> {
    const panel = new Panel()
    panel.name = data.name
    panel.description = data.description
    panel.tenantId = data.tenantId
    panel.userId = data.userId

    // Create default cohort rule
    const cohortRule = new CohortRule()
    cohortRule.conditions = []
    cohortRule.logic = 'AND'
    panel.cohortRule = cohortRule

    await this.em.persistAndFlush([panel, cohortRule])

    // Track change
    await this.changeTracker.recordChange({
      entityType: 'Panel',
      entityId: panel.id,
      action: 'CREATE',
      tenantId: data.tenantId,
      userId: data.userId
    })

    return panel
  }

  async findAll(query: ListPanelsQuery): Promise<ListPanelsResponse> {
    const panels = await this.em.find(Panel, {
      tenantId: query.tenantId,
      userId: query.userId
    }, {
      populate: ['cohortRule']
    })

    return panels
  }
}
\`\`\`

### Data Source Service
\`\`\`typescript
export class DataSourceService {
  async create(panelId: string, data: CreateDataSourceRequest): Promise<CreateDataSourceResponse> {
    const panel = await this.em.findOneOrFail(Panel, panelId)
    
    const dataSource = new DataSource()
    dataSource.type = data.type
    dataSource.config = data.config
    dataSource.panel = panel
    dataSource.tenantId = data.tenantId
    dataSource.userId = data.userId

    await this.em.persistAndFlush(dataSource)

    // Trigger initial sync
    await this.syncData(dataSource.id, data.tenantId, data.userId)

    return dataSource
  }

  async syncData(dataSourceId: number, tenantId: string, userId: string): Promise<void> {
    const dataSource = await this.em.findOneOrFail(DataSource, dataSourceId)
    
    // Implement sync logic based on data source type
    switch (dataSource.type) {
      case 'database':
        await this.syncDatabaseSource(dataSource)
        break
      case 'api':
        await this.syncApiSource(dataSource)
        break
      case 'file':
        await this.syncFileSource(dataSource)
        break
    }

    dataSource.lastSyncAt = new Date()
    await this.em.flush()
  }
}
\`\`\`

## Validation & Type Safety

### Zod Schema Definitions
\`\`\`typescript
// Panel schemas
export const CreatePanelSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  tenantId: z.string(),
  userId: z.string()
})

export const CreatePanelResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  tenantId: z.string(),
  userId: z.string(),
  cohortRule: CohortRuleSchema,
  createdAt: z.date(),
  updatedAt: z.date()
})

// Data source schemas
export const CreateDataSourceSchema = z.object({
  type: z.enum(['database', 'api', 'file']),
  config: z.record(z.any()),
  tenantId: z.string(),
  userId: z.string()
})
\`\`\`

### Type Generation
Types are automatically generated from Zod schemas:

\`\`\`typescript
export type CreatePanelRequest = z.infer<typeof CreatePanelSchema>
export type CreatePanelResponse = z.infer<typeof CreatePanelResponseSchema>
export type CreateDataSourceRequest = z.infer<typeof CreateDataSourceSchema>
\`\`\`

## Authentication & Authorization

### JWT Authentication
\`\`\`typescript
// JWT plugin configuration
await fastify.register(fastifyJwt, {
  secret: process.env.JWT_SECRET!,
  sign: {
    algorithm: 'HS256',
    expiresIn: '24h'
  }
})

// Authentication hook
fastify.addHook('preHandler', async (request, reply) => {
  try {
    await request.jwtVerify()
  } catch (err) {
    reply.send(err)
  }
})
\`\`\`

### Multi-tenant Security
\`\`\`typescript
// Tenant isolation middleware
export async function tenantIsolation(request: FastifyRequest, reply: FastifyReply) {
  const userTenant = request.user.tenantId
  const requestTenant = request.body.tenantId || request.params.tenantId

  if (userTenant !== requestTenant) {
    return reply.code(403).send({ error: 'Access denied to tenant' })
  }
}
\`\`\`

## Performance Optimization

### Database Optimization
\`\`\`typescript
// Connection pooling
const config: Options = {
  type: 'postgresql',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  dbName: process.env.DB_NAME,
  pool: {
    min: 2,
    max: 10,
    acquireTimeoutMillis: 30000,
    createTimeoutMillis: 30000,
    destroyTimeoutMillis: 5000,
    reapIntervalMillis: 1000,
    createRetryIntervalMillis: 200
  }
}

// Query optimization with proper indexing
@Index({ properties: ['tenantId', 'userId'] })
@Index({ properties: ['tenantId', 'createdAt'] })
@Entity()
export class Panel { ... }
\`\`\`

### Caching Strategy
\`\`\`typescript
// Redis caching
export class CacheService {
  constructor(private redis: Redis) {}

  async get<T>(key: string): Promise<T | null> {
    const value = await this.redis.get(key)
    return value ? JSON.parse(value) : null
  }

  async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    await this.redis.setex(key, ttl, JSON.stringify(value))
  }

  async invalidate(pattern: string): Promise<void> {
    const keys = await this.redis.keys(pattern)
    if (keys.length > 0) {
      await this.redis.del(...keys)
    }
  }
}
\`\`\`

## Testing Framework

### Test Setup
\`\`\`typescript
// Test configuration
import { MikroORM } from '@mikro-orm/core'
import { FastifyInstance } from 'fastify'
import { buildApp } from '../src/app'

describe('Panel API', () => {
  let app: FastifyInstance
  let orm: MikroORM

  beforeAll(async () => {
    app = await buildApp()
    orm = app.orm
    await orm.getSchemaGenerator().createSchema()
  })

  afterAll(async () => {
    await orm.close()
    await app.close()
  })

  beforeEach(async () => {
    await orm.getSchemaGenerator().clearDatabase()
  })
})
\`\`\`

### API Testing
\`\`\`typescript
// Panel creation test
it('should create a panel', async () => {
  const response = await app.inject({
    method: 'POST',
    url: '/api/panels',
    headers: {
      authorization: `Bearer ${authToken}`
    },
    payload: {
      name: 'Test Panel',
      description: 'Test Description',
      tenantId: 'tenant-123',
      userId: 'user-456'
    }
  })

  expect(response.statusCode).toBe(200)
  
  const panel = JSON.parse(response.payload)
  expect(panel.name).toBe('Test Panel')
  expect(panel.tenantId).toBe('tenant-123')
  expect(panel.cohortRule).toBeDefined()
})
\`\`\`

## Development Workflow

### Available Scripts
\`\`\`bash
# Development
pnpm dev                 # Start development server with watch mode
pnpm build              # Build TypeScript to JavaScript
pnpm start              # Start production server

# Database
pnpm migration:create   # Create new migration
pnpm migration:apply    # Apply pending migrations
pnpm schema:fresh       # Drop and recreate schema

# Code Quality
pnpm lint               # Run ESLint
pnpm typecheck          # TypeScript type checking
pnpm format             # Format code with Biome

# Testing
pnpm test               # Run tests
pnpm test:watch         # Run tests in watch mode
pnpm test:coverage      # Run tests with coverage
\`\`\`

### Development Server
\`\`\`bash
# Start development server
cd apps/services
pnpm dev

# Server starts with:
# - Hot reload enabled
# - Auto-compilation of TypeScript
# - Database connection pooling
# - API documentation at /docs
\`\`\`

## API Documentation

### Auto-generated Documentation
\`\`\`typescript
// Swagger/OpenAPI setup
await fastify.register(fastifySwagger, {
  openapi: {
    openapi: '3.0.0',
    info: {
      title: 'Panels API',
      description: 'API documentation for Panels Management System',
      version: '1.0.0'
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server'
      }
    ]
  }
})

await fastify.register(fastifySwaggerUi, {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'list',
    deepLinking: false
  }
})
\`\`\`

### Bruno API Collection
The project includes a comprehensive Bruno API testing collection:

\`\`\`
api-tests/
├── panels/
│   ├── create-panel.bru
│   ├── list-panels.bru
│   └── update-panel.bru
├── datasources/
│   ├── create-datasource.bru
│   └── sync-datasource.bru
└── environments/
    ├── development.bru
    └── production.bru
\`\`\`

## Deployment & Production

### Environment Configuration
\`\`\`bash
# Production environment variables
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://user:pass@host:5432/panels
REDIS_URL=redis://host:6379
JWT_SECRET=your-secure-secret
LOG_LEVEL=info
\`\`\`

### Docker Configuration
\`\`\`dockerfile
FROM node:22-alpine
WORKDIR /app

# Install dependencies
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile --prod

# Copy built application
COPY dist/ ./dist/

# Set up health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

EXPOSE 3001
CMD ["node", "dist/app.js"]
\`\`\`

### Production Optimizations
- **Connection pooling** for database efficiency
- **Response compression** with @fastify/compress
- **Rate limiting** with @fastify/rate-limit
- **Security headers** with @fastify/helmet
- **Request logging** with structured logs
- **Health checks** for monitoring
- **Graceful shutdown** handling

## Monitoring & Observability

### Health Checks
\`\`\`typescript
// Health check endpoint
fastify.get('/health', async (request, reply) => {
  const dbStatus = await checkDatabaseConnection()
  const redisStatus = await checkRedisConnection()
  
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: dbStatus,
    redis: redisStatus
  }
  
  return reply.send(health)
})
\`\`\`

### Structured Logging
\`\`\`typescript
// Logger configuration
const logger = {
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'HH:MM:ss Z',
      ignore: 'pid,hostname'
    }
  }
}
\`\`\`

## Future Enhancements

### Planned Features
- **GraphQL API**: Alternative query interface
- **Real-time Subscriptions**: WebSocket support
- **Event Sourcing**: Event-driven architecture
- **Microservices**: Service decomposition
- **API Versioning**: Backward compatibility

### Performance Improvements
- **Database Sharding**: Horizontal scaling
- **Read Replicas**: Query optimization
- **Advanced Caching**: Multi-layer caching
- **Query Optimization**: Automatic query tuning

## Related Documentation

- [API Reference](/reference/backend-api/panel-endpoints.md)
- [Database Schema](/reference/database/schema.md)
- [Deployment Guide](/guides/deployment/production-setup.md)
- [Testing Strategies](/guides/development/testing-strategies.md)
