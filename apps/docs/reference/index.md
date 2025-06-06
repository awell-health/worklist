# Reference Documentation

This section provides comprehensive reference documentation for all components of the Panels Management System.

## API Reference

Complete documentation for all API interfaces:

### API Client
- **[Panels API](./api-client/panels-api.md)** - Complete panelsAPI client reference
- **[Views API](./api-client/views-api.md)** - Complete viewsAPI client reference
- **[TypeScript Types](./api-client/typescript-types.md)** - All API client type definitions
- **[Error Handling](./api-client/error-handling.md)** - Error types and handling patterns

### Backend API Endpoints
- **[Panel Endpoints](./backend-api/panel-endpoints.md)** - Panel management REST API
- **[View Endpoints](./backend-api/view-endpoints.md)** - View management REST API
- **[Column Endpoints](./backend-api/column-endpoints.md)** - Column management REST API
- **[Data Source Endpoints](./backend-api/datasource-endpoints.md)** - Data source REST API
- **[Change Endpoints](./backend-api/change-endpoints.md)** - Change tracking REST API

### API Authentication
- **[JWT Authentication](./backend-api/jwt-auth.md)** - JWT token handling
- **[API Keys](./backend-api/api-keys.md)** - API key authentication
- **[Rate Limiting](./backend-api/rate-limiting.md)** - Rate limiting configuration

## Data Schemas

Complete schema definitions for all data structures:

### Core Entities
- **[Panel Schema](./schemas/panel-schema.md)** - Panel entity structure
- **[View Schema](./schemas/view-schema.md)** - View entity structure  
- **[Column Schema](./schemas/column-schema.md)** - Column entity structures
- **[Data Source Schema](./schemas/datasource-schema.md)** - Data source configurations
- **[Change Schema](./schemas/change-schema.md)** - Change tracking structure

### Validation Schemas
- **[Zod Schemas](./schemas/zod-schemas.md)** - Runtime validation schemas
- **[Request Validation](./schemas/request-validation.md)** - API request validation
- **[Response Validation](./schemas/response-validation.md)** - API response validation

## Database Reference

Database schema and operations:

### Tables & Relationships
- **[Database Schema](./database/schema.md)** - Complete database structure
- **[Entity Relationships](./database/relationships.md)** - Entity relationship diagram
- **[Indexes](./database/indexes.md)** - Database index definitions
- **[Constraints](./database/constraints.md)** - Database constraints

### Migrations
- **[Migration System](./database/migrations.md)** - Migration management
- **[Schema Evolution](./database/schema-evolution.md)** - Database versioning
- **[Data Migrations](./database/data-migrations.md)** - Data transformation migrations

## Configuration Reference

System configuration options:

### Environment Variables
- **[Backend Configuration](./configuration/backend-config.md)** - Backend environment variables
- **[Frontend Configuration](./configuration/frontend-config.md)** - Frontend configuration
- **[Database Configuration](./configuration/database-config.md)** - Database connection settings
- **[Redis Configuration](./configuration/redis-config.md)** - Redis cache configuration

### Application Settings
- **[Multi-tenant Settings](./configuration/multi-tenant.md)** - Tenant configuration
- **[Security Settings](./configuration/security.md)** - Security configuration
- **[Performance Settings](./configuration/performance.md)** - Performance tuning
- **[Logging Configuration](./configuration/logging.md)** - Logging setup

## Frontend Components

React component reference:

### UI Components
- **[Panel Components](./frontend/panel-components.md)** - Panel UI components
- **[View Components](./frontend/view-components.md)** - View UI components
- **[Column Components](./frontend/column-components.md)** - Column UI components
- **[Form Components](./frontend/form-components.md)** - Form and input components

### Hooks & Utilities
- **[API Hooks](./frontend/api-hooks.md)** - React hooks for API calls
- **[State Management](./frontend/state-management.md)** - State management patterns
- **[Utilities](./frontend/utilities.md)** - Utility functions and helpers

## TypeScript Types

Complete type definitions:

### Shared Types
- **[@panels/types Package](./types/shared-types.md)** - Shared type definitions
- **[Panel Types](./types/panel-types.md)** - Panel-related types
- **[View Types](./types/view-types.md)** - View-related types
- **[Column Types](./types/column-types.md)** - Column-related types
- **[Data Source Types](./types/datasource-types.md)** - Data source types

### Frontend Types
- **[Component Props](./types/component-props.md)** - React component prop types
- **[State Types](./types/state-types.md)** - Application state types
- **[Event Types](./types/event-types.md)** - Event handler types

### Backend Types
- **[Entity Types](./types/entity-types.md)** - Database entity types
- **[Service Types](./types/service-types.md)** - Service layer types
- **[Route Types](./types/route-types.md)** - HTTP route types

## CLI Reference

Command-line tools and scripts:

### Development Commands
- **[pnpm Scripts](./cli/pnpm-scripts.md)** - Package.json scripts reference
- **[Database Commands](./cli/database-commands.md)** - Database management commands
- **[Development Tools](./cli/development-tools.md)** - Development utility commands

### Production Commands
- **[Build Commands](./cli/build-commands.md)** - Production build commands
- **[Deployment Commands](./cli/deployment-commands.md)** - Deployment scripts
- **[Maintenance Commands](./cli/maintenance-commands.md)** - System maintenance

## Testing Reference

Testing tools and utilities:

### Testing Framework
- **[Vitest Configuration](./testing/vitest-config.md)** - Test framework setup
- **[Test Utilities](./testing/test-utilities.md)** - Testing helper functions
- **[Mock Utilities](./testing/mock-utilities.md)** - Mocking and fixture utilities

### Test Patterns
- **[API Testing](./testing/api-testing.md)** - API testing patterns
- **[Component Testing](./testing/component-testing.md)** - React component testing
- **[Integration Testing](./testing/integration-testing.md)** - Integration test patterns

## Error Codes

Complete error code reference:

### API Error Codes
- **[HTTP Status Codes](./errors/http-status-codes.md)** - HTTP response codes
- **[Custom Error Codes](./errors/custom-error-codes.md)** - Application-specific errors
- **[Validation Errors](./errors/validation-errors.md)** - Input validation errors

### System Error Codes
- **[Database Errors](./errors/database-errors.md)** - Database operation errors
- **[Authentication Errors](./errors/auth-errors.md)** - Authentication failures
- **[Authorization Errors](./errors/authorization-errors.md)** - Permission errors

## Performance Benchmarks

Performance characteristics and benchmarks:

### API Performance
- **[Response Time Benchmarks](./performance/response-times.md)** - API response time targets
- **[Throughput Metrics](./performance/throughput.md)** - Request throughput benchmarks
- **[Resource Usage](./performance/resource-usage.md)** - Memory and CPU usage

### Database Performance
- **[Query Performance](./performance/query-performance.md)** - Database query benchmarks
- **[Connection Pooling](./performance/connection-pooling.md)** - Connection pool configuration
- **[Index Performance](./performance/index-performance.md)** - Database index optimization

## Security Reference

Security features and configurations:

### Authentication & Authorization
- **[JWT Tokens](./security/jwt-tokens.md)** - JWT token structure and validation
- **[Role-Based Access](./security/rbac.md)** - Role-based access control
- **[Tenant Isolation](./security/tenant-isolation.md)** - Multi-tenant security

### Data Protection
- **[Encryption Standards](./security/encryption.md)** - Data encryption methods
- **[Input Sanitization](./security/input-sanitization.md)** - Input validation and sanitization
- **[Audit Logging](./security/audit-logging.md)** - Security audit trails

---

## Reference Navigation

### Quick Access
- **[API Quick Reference](./quick-reference/api-quick-ref.md)** - Most common API calls
- **[Configuration Quick Start](./quick-reference/config-quick-start.md)** - Essential configuration
- **[Troubleshooting Quick Guide](./quick-reference/troubleshooting-quick.md)** - Common issue solutions

### Search & Index
- **[API Index](./indexes/api-index.md)** - Alphabetical API reference
- **[Type Index](./indexes/type-index.md)** - Alphabetical type reference
- **[Configuration Index](./indexes/config-index.md)** - Configuration option index

## Versioning

This reference documentation is versioned alongside the codebase:

- **Current Version**: Latest development version
- **Stable Versions**: Tagged release documentation
- **Breaking Changes**: Documented in migration guides
- **Deprecation Notices**: Clearly marked throughout reference
