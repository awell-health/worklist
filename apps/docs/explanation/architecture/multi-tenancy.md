# Multi-tenancy Architecture

This document explains how the Panels Management System implements multi-tenancy to provide secure, isolated environments for different organizations while maintaining efficiency and scalability.

## Overview

Multi-tenancy in the Panels system provides complete data isolation between different organizations (tenants) while sharing the same application infrastructure. This approach enables:

- **Cost Efficiency**: Shared infrastructure reduces per-tenant costs
- **Scalability**: Single codebase serves multiple organizations
- **Security**: Complete data isolation between tenants
- **Maintenance**: Centralized updates and maintenance
- **Flexibility**: Tenant-specific configurations and customizations

## Tenancy Model

### Tenant Hierarchy

\`\`\`
Organization (Tenant)
├── Users
├── Panels
│   ├── Data Sources
│   ├── Columns
│   └── Views
└── Configuration
    ├── Authentication Settings
    ├── Feature Flags
    └── Customizations
\`\`\`

### Tenant Entity

\`\`\`typescript
interface Tenant {
  id: string                    // Unique tenant identifier
  name: string                  // Organization name
  subdomain?: string            // Optional subdomain (e.g., acme.panels.com)
  plan: TenantPlan             // Subscription plan
  settings: TenantSettings     // Tenant-specific configuration
  status: TenantStatus         // Active, suspended, etc.
  createdAt: Date              // Creation timestamp
  updatedAt: Date              // Last modification
}

type TenantPlan = 'free' | 'starter' | 'professional' | 'enterprise'
type TenantStatus = 'active' | 'suspended' | 'archived'

interface TenantSettings {
  authentication: AuthSettings
  features: FeatureFlags
  branding: BrandingConfig
  limits: ResourceLimits
}
\`\`\`

## Data Isolation Strategy

### Row-Level Security (RLS)

Every data entity includes a `tenantId` field that enforces complete data separation:

\`\`\`typescript
// Example entity with tenant isolation
@Entity()
export class Panel {
  @PrimaryKey()
  id!: number

  @Property()
  tenantId!: string  // Required for all entities

  @Property()
  name!: string

  // ... other properties
}
\`\`\`

### Query-Level Isolation

All database queries automatically include tenant filtering:

\`\`\`typescript
// Service layer automatically enforces tenant isolation
export class PanelService {
  async findAll(tenantId: string, userId: string): Promise<Panel[]> {
    return this.em.find(Panel, {
      tenantId,      // Always required
      userId         // User-level filtering within tenant
    })
  }

  async findById(id: number, tenantId: string): Promise<Panel> {
    const panel = await this.em.findOneOrFail(Panel, { 
      id, 
      tenantId     // Prevents cross-tenant access
    })
    return panel
  }
}
\`\`\`

### Database-Level Isolation

PostgreSQL Row-Level Security (RLS) provides additional protection:

\`\`\`sql
-- Enable RLS on all tenant-aware tables
ALTER TABLE panels ENABLE ROW LEVEL SECURITY;

-- Create policy to enforce tenant isolation
CREATE POLICY tenant_isolation_policy ON panels
  FOR ALL
  TO application_role
  USING (tenant_id = current_setting('app.current_tenant_id'));

-- Set tenant context for all queries
SET app.current_tenant_id = 'tenant-123';
\`\`\`

## Authentication & Authorization

### Multi-tenant Authentication

Users belong to specific tenants and can only access their tenant's data:

\`\`\`typescript
interface User {
  id: string
  email: string
  tenantId: string              // Primary tenant membership
  tenantMemberships: TenantMembership[] // Multi-tenant access
  roles: UserRole[]
}

interface TenantMembership {
  tenantId: string
  roles: string[]
  permissions: Permission[]
  joinedAt: Date
  status: 'active' | 'invited' | 'suspended'
}
\`\`\`

### JWT Token Structure

JWTs include tenant context for request-level isolation:

\`\`\`typescript
interface JWTPayload {
  userId: string
  email: string
  tenantId: string              // Primary tenant
  tenants: string[]             // All accessible tenants
  roles: string[]
  permissions: string[]
  iat: number
  exp: number
}
\`\`\`

### Request Context

Every API request includes tenant context:

\`\`\`typescript
// Middleware to extract and validate tenant context
export async function tenantMiddleware(
  request: FastifyRequest, 
  reply: FastifyReply
) {
  const token = request.headers.authorization?.replace('Bearer ', '')
  const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
  
  // Validate tenant access
  const requestedTenant = request.body?.tenantId || request.params?.tenantId
  if (!decoded.tenants.includes(requestedTenant)) {
    return reply.code(403).send({ error: 'Tenant access denied' })
  }
  
  // Set tenant context
  request.tenantId = requestedTenant
  request.userId = decoded.userId
}
\`\`\`

## API Isolation

### Route-Level Tenant Validation

All API endpoints validate tenant access:

\`\`\`typescript
// Panel routes with tenant validation
export async function panelRoutes(fastify: FastifyInstance) {
  // Apply tenant middleware to all routes
  fastify.addHook('preHandler', tenantMiddleware)

  fastify.post('/', {
    schema: {
      body: CreatePanelSchema.extend({
        tenantId: z.string() // Required in request body
      })
    }
  }, async (request, reply) => {
    // Verify request tenant matches user context
    if (request.body.tenantId !== request.tenantId) {
      return reply.code(403).send({ error: 'Tenant mismatch' })
    }
    
    const panel = await panelService.create(request.body)
    return reply.send(panel)
  })
}
\`\`\`

### Cross-Tenant Data Prevention

Additional safeguards prevent accidental cross-tenant data access:

\`\`\`typescript
// Service layer validation
export class PanelService {
  async update(
    id: number, 
    data: UpdatePanelRequest, 
    tenantId: string
  ): Promise<Panel> {
    // First, verify panel belongs to tenant
    const existingPanel = await this.em.findOneOrFail(Panel, { 
      id, 
      tenantId 
    })
    
    // Prevent tenant ID changes
    if (data.tenantId && data.tenantId !== tenantId) {
      throw new Error('Cannot change panel tenant')
    }
    
    // Update panel
    existingPanel.assign(data)
    await this.em.flush()
    
    return existingPanel
  }
}
\`\`\`

## Database Design for Multi-tenancy

### Tenant-Aware Entities

All entities follow consistent tenant isolation patterns:

\`\`\`typescript
// Base entity with tenant isolation
@Entity()
export abstract class TenantEntity {
  @Property()
  tenantId!: string

  @Property()
  createdAt = new Date()

  @Property({ onUpdate: () => new Date() })
  updatedAt = new Date()
}

// Domain entities extend base
@Entity()
export class Panel extends TenantEntity {
  @PrimaryKey()
  id!: number

  @Property()
  name!: string

  @Property()
  userId!: string  // User-level ownership within tenant

  // ... other properties
}
\`\`\`

### Indexing Strategy

Database indexes support efficient tenant-aware queries:

\`\`\`sql
-- Composite indexes for tenant + user queries
CREATE INDEX idx_panels_tenant_user ON panels(tenant_id, user_id);
CREATE INDEX idx_panels_tenant_created ON panels(tenant_id, created_at);

-- Tenant-only indexes for cross-user queries (admin operations)
CREATE INDEX idx_panels_tenant ON panels(tenant_id);
CREATE INDEX idx_datasources_tenant ON datasources(tenant_id);
\`\`\`

### Query Performance

Tenant isolation maintains query performance through proper indexing:

\`\`\`typescript
// Optimized tenant-aware queries
export class PanelRepository {
  // User panels within tenant (most common)
  async findUserPanels(tenantId: string, userId: string) {
    return this.em.find(Panel, { tenantId, userId }, {
      orderBy: { createdAt: 'DESC' },
      limit: 50
    })
    // Uses idx_panels_tenant_user index
  }

  // All tenant panels (admin view)
  async findTenantPanels(tenantId: string) {
    return this.em.find(Panel, { tenantId }, {
      orderBy: { createdAt: 'DESC' }
    })
    // Uses idx_panels_tenant index
  }
}
\`\`\`

## Tenant Configuration

### Feature Flags

Different tenants can have different feature sets:

\`\`\`typescript
interface FeatureFlags {
  calculatedColumns: boolean    // Pro feature
  publicViews: boolean         // Enterprise feature
  apiAccess: boolean           // Paid feature
  customBranding: boolean      // Enterprise feature
  ssoIntegration: boolean      // Enterprise feature
  maxPanels: number           // Plan-based limit
  maxUsers: number            // Plan-based limit
}

// Feature validation in services
export class PanelService {
  async create(data: CreatePanelRequest): Promise<Panel> {
    const tenant = await this.tenantService.findById(data.tenantId)
    
    // Check panel limits
    const existingPanels = await this.countUserPanels(data.tenantId, data.userId)
    if (existingPanels >= tenant.settings.limits.maxPanels) {
      throw new Error('Panel limit reached for tenant plan')
    }
    
    // Create panel
    return this.createPanel(data)
  }
}
\`\`\`

### Custom Branding

Tenants can customize the application appearance:

\`\`\`typescript
interface BrandingConfig {
  logo?: string                // Custom logo URL
  primaryColor?: string        // Brand color
  secondaryColor?: string      // Accent color
  customCSS?: string          // Additional styling
  faviconUrl?: string         // Custom favicon
  applicationName?: string     // Custom app name
}

// Frontend applies tenant branding
export function useTenantBranding(tenantId: string) {
  const [branding, setBranding] = useState<BrandingConfig>()
  
  useEffect(() => {
    // Load tenant branding configuration
    fetchTenantBranding(tenantId).then(setBranding)
  }, [tenantId])
  
  return branding
}
\`\`\`

## Scaling Considerations

### Horizontal Scaling

The multi-tenant architecture supports various scaling strategies:

**Shared Database, Shared Schema**:
- Current implementation
- Cost-effective for many small tenants
- Shared infrastructure and maintenance

**Shared Database, Separate Schemas**:
- Database-level isolation
- Better performance isolation
- More complex management

**Separate Databases**:
- Complete isolation
- Scales for large enterprise tenants
- Higher operational complexity

### Tenant Sharding

For very large deployments, tenants can be distributed across multiple database instances:

\`\`\`typescript
// Tenant router for sharded deployments
export class TenantRouter {
  private shards: Map<string, DatabaseConnection>

  getShardForTenant(tenantId: string): DatabaseConnection {
    // Hash-based tenant distribution
    const shardKey = this.hash(tenantId) % this.shards.size
    return this.shards.get(`shard-${shardKey}`)
  }
  
  async routeQuery<T>(
    tenantId: string, 
    query: () => Promise<T>
  ): Promise<T> {
    const shard = this.getShardForTenant(tenantId)
    return shard.execute(query)
  }
}
\`\`\`

## Tenant Lifecycle Management

### Tenant Onboarding

New tenant setup includes:

\`\`\`typescript
export class TenantService {
  async createTenant(data: CreateTenantRequest): Promise<Tenant> {
    return this.em.transactional(async (em) => {
      // 1. Create tenant entity
      const tenant = new Tenant()
      tenant.id = generateTenantId()
      tenant.name = data.name
      tenant.plan = data.plan
      tenant.settings = getDefaultSettings(data.plan)
      
      // 2. Create admin user
      const adminUser = new User()
      adminUser.email = data.adminEmail
      adminUser.tenantId = tenant.id
      adminUser.roles = ['admin']
      
      // 3. Set up default resources
      const defaultPanel = new Panel()
      defaultPanel.name = 'Welcome Panel'
      defaultPanel.tenantId = tenant.id
      defaultPanel.userId = adminUser.id
      
      await em.persistAndFlush([tenant, adminUser, defaultPanel])
      
      // 4. Send welcome email
      await this.emailService.sendWelcomeEmail(adminUser.email, tenant)
      
      return tenant
    })
  }
}
\`\`\`

### Tenant Migration

Moving tenants between shards or upgrading plans:

\`\`\`typescript
export class TenantMigrationService {
  async migrateTenant(
    tenantId: string, 
    targetShard: string
  ): Promise<void> {
    // 1. Export tenant data
    const tenantData = await this.exportTenantData(tenantId)
    
    // 2. Import to target shard
    await this.importTenantData(tenantData, targetShard)
    
    // 3. Verify migration
    await this.verifyMigration(tenantId, targetShard)
    
    // 4. Update tenant routing
    await this.updateTenantRouting(tenantId, targetShard)
    
    // 5. Clean up source data
    await this.cleanupSourceTenant(tenantId)
  }
}
\`\`\`

## Security Considerations

### Cross-Tenant Attack Prevention

Multiple layers prevent cross-tenant data access:

1. **Application Layer**: Tenant validation in all services
2. **Database Layer**: Row-level security policies
3. **Network Layer**: Tenant-specific subdomains/routing
4. **Monitoring**: Cross-tenant access detection

### Audit and Compliance

All tenant operations are logged for compliance:

\`\`\`typescript
// Tenant-aware audit logging
export class AuditService {
  async logAction(
    action: string,
    entityType: string,
    entityId: string,
    tenantId: string,
    userId: string,
    metadata?: any
  ) {
    const auditLog = new AuditLog()
    auditLog.action = action
    auditLog.entityType = entityType
    auditLog.entityId = entityId
    auditLog.tenantId = tenantId    // Tenant context
    auditLog.userId = userId
    auditLog.metadata = metadata
    auditLog.timestamp = new Date()
    
    await this.em.persistAndFlush(auditLog)
  }
}
\`\`\`

### Data Residency

For compliance requirements, tenant data can be geo-located:

\`\`\`typescript
interface TenantSettings {
  dataResidency: {
    region: string              // e.g., 'eu-west-1', 'us-east-1'
    encryptionRequired: boolean
    retentionPolicy: number     // Days
  }
}
\`\`\`

## Monitoring & Observability

### Tenant-Specific Metrics

Monitoring includes tenant-level breakdown:

\`\`\`typescript
// Tenant performance metrics
export class TenantMetrics {
  async recordApiCall(tenantId: string, endpoint: string, duration: number) {
    this.metrics.histogram('api_duration', duration, {
      tenant: tenantId,
      endpoint
    })
  }
  
  async recordResourceUsage(tenantId: string, resource: string, count: number) {
    this.metrics.gauge('resource_usage', count, {
      tenant: tenantId,
      resource
    })
  }
}
\`\`\`

### Tenant Health Monitoring

Automated monitoring for tenant-specific issues:

\`\`\`typescript
// Tenant health checks
export class TenantHealthService {
  async checkTenantHealth(tenantId: string): Promise<HealthStatus> {
    const checks = await Promise.all([
      this.checkDatabaseConnectivity(tenantId),
      this.checkResourceLimits(tenantId),
      this.checkApiPerformance(tenantId),
      this.checkDataIntegrity(tenantId)
    ])
    
    return {
      status: checks.every(check => check.healthy) ? 'healthy' : 'degraded',
      checks,
      timestamp: new Date()
    }
  }
}
\`\`\`

## Future Considerations

### Advanced Multi-tenancy

Planned enhancements for enterprise deployments:

- **Tenant Hierarchies**: Sub-organizations and departments
- **Cross-Tenant Sharing**: Controlled data sharing between tenants
- **Tenant Templates**: Pre-configured tenant setups
- **White-label Solutions**: Complete branding customization
- **Federated Authentication**: Enterprise SSO integration

### Performance Optimization

Advanced techniques for scale:

- **Tenant-aware Caching**: Redis clustering by tenant
- **Connection Pooling**: Tenant-specific database pools
- **Query Optimization**: Tenant-specific query plans
- **Resource Quotas**: CPU and memory limits per tenant

## Related Documentation

- [System Overview](./system-overview.md) - Overall architecture
- [Security Model](./security-model.md) - Security implementation
- [Data Model](./data-model.md) - Entity relationships
- [Authentication Guide](/guides/api-client/authentication.md) - API authentication
