# Developer Guide

Welcome to the comprehensive developer guide for the Panels project. This section covers everything you need to build, integrate, and extend the Panels system.

## 🛠️ Development Fundamentals

### Getting Started as a Developer

1. **[Environment Setup](../../getting-started/environment-setup.md)** - Configure your development environment
2. **[Architecture Overview](./architecture.md)** - Understand the system architecture
3. **[API Integration](./api-integration/)** - Learn how to interact with the Panels API
4. **[Testing Strategies](./testing/)** - Comprehensive testing approaches

## 🔧 Core Development Areas

### API Development
- **[RESTful API Design](./api-integration/rest-api.md)** - API design principles and patterns
- **[Authentication & Authorization](./api-integration/auth.md)** - JWT and multi-tenant security
- **[Error Handling](./api-integration/error-handling.md)** - Robust error handling strategies
- **[Rate Limiting](./api-integration/rate-limiting.md)** - API rate limiting and throttling

### Frontend Development
- **[React Integration](./frontend/react-integration.md)** - Building with React and Next.js
- **[State Management](./frontend/state-management.md)** - Managing application state
- **[Component Library](./frontend/components.md)** - Using and extending components
- **[Responsive Design](./frontend/responsive-design.md)** - Mobile-first development

### Backend Development
- **[Fastify Framework](./backend/fastify.md)** - Working with the Fastify framework
- **[Database Integration](./backend/database.md)** - MikroORM and PostgreSQL patterns
- **[Background Jobs](./backend/background-jobs.md)** - Async processing with Redis
- **[Microservices](./backend/microservices.md)** - Service architecture patterns

## 📊 Data & Integration

### Database Development
- **[MikroORM Entities](../reference/database/entities.md)** - Understanding the data model
- **[Migrations](../reference/database/migrations.md)** - Database schema management
- **[Query Optimization](./database/performance.md)** - Database performance tuning
- **[Data Seeding](./database/seeding.md)** - Test data and fixtures

### External Integrations
- **[Medplum Integration](./integrations/medplum.md)** - Healthcare data integration
- **[FHIR Resources](./integrations/fhir.md)** - Working with FHIR standards
- **[Third-party APIs](./integrations/third-party.md)** - External API integration patterns
- **[Webhooks](./integrations/webhooks.md)** - Event-driven integrations

## 🧪 Testing & Quality

### Testing Framework
- **[Unit Testing](./testing/unit-tests.md)** - Component and function testing
- **[Integration Testing](./testing/integration-tests.md)** - API and database testing
- **[End-to-End Testing](./testing/e2e-tests.md)** - Full workflow testing
- **[Test Data Management](./testing/test-data.md)** - Mock data and fixtures

### Code Quality
- **[Code Standards](./quality/code-standards.md)** - TypeScript and formatting rules
- **[Performance Monitoring](./quality/performance.md)** - Application performance
- **[Security Best Practices](./quality/security.md)** - Security guidelines
- **[Code Review Process](./quality/code-review.md)** - Review guidelines

## 🚀 Advanced Topics

### Performance & Scaling
- **[Caching Strategies](./advanced/caching.md)** - Redis and application caching
- **[Database Scaling](./advanced/database-scaling.md)** - PostgreSQL optimization
- **[Load Testing](./advanced/load-testing.md)** - Performance testing
- **[Monitoring](./advanced/monitoring.md)** - Application monitoring

### Customization & Extensions
- **[Plugin Development](./advanced/plugins.md)** - Extending the platform
- **[Custom Calculated Columns](./advanced/calculated-columns.md)** - Formula development
- **[Custom Data Sources](./advanced/data-sources.md)** - New data source types
- **[UI Customization](./advanced/ui-customization.md)** - Theming and branding

## 🛠️ Development Tools

### IDE Setup
- **[VS Code Configuration](./tools/vscode.md)** - Recommended extensions and settings
- **[Debugging](./tools/debugging.md)** - Local and remote debugging
- **[Git Workflow](./tools/git-workflow.md)** - Branch strategy and commits
- **[Docker Development](./tools/docker.md)** - Container-based development

### CLI Tools
- **[pnpm Commands](./tools/pnpm-commands.md)** - Package management
- **[Turbo Usage](./tools/turbo.md)** - Monorepo build system
- **[Database CLI](./tools/database-cli.md)** - MikroORM CLI commands
- **[Environment Scripts](./tools/env-scripts.md)** - Development scripts

## 📚 Reference Materials

### API Reference
- **[Panel Management API](../reference/api/panels.md)** - Panel CRUD operations
- **[Data Source API](../reference/api/data-sources.md)** - Data source management
- **[Column API](../reference/api/columns.md)** - Column operations
- **[View API](../reference/api/views.md)** - View management and publishing

### Code Examples
- **[API Integration Examples](../examples/api-integration/)** - Complete integration examples
- **[React Component Examples](../examples/react-components/)** - UI component examples
- **[Database Query Examples](../examples/database-queries/)** - Common query patterns
- **[Testing Examples](../examples/testing/)** - Test case examples

## 🤝 Contributing

### Contribution Guidelines
- **[Getting Started Contributing](./contributing/getting-started.md)** - First contribution guide
- **[Code Contribution](./contributing/code.md)** - Code submission process
- **[Documentation Contribution](./contributing/documentation.md)** - Improving docs
- **[Bug Reports](./contributing/bug-reports.md)** - Reporting issues

### Community
- **[Code of Conduct](./contributing/code-of-conduct.md)** - Community guidelines
- **[Development Process](./contributing/development-process.md)** - How we work
- **[Release Process](./contributing/releases.md)** - Release management
- **[Roadmap](./contributing/roadmap.md)** - Future development plans

---

## Quick Start for Developers

```bash
# 1. Clone and setup
git clone <repository-url>
cd worklist
pnpm bootstrap

# 2. Generate environment files
pnpm generate:env

# 3. Start infrastructure
pnpm run:infra

# 4. Start development
pnpm dev

# 5. Run tests
pnpm test
```

## Common Developer Tasks

| Task | Command | Description |
|------|---------|-------------|
| Add new API endpoint | `pnpm --filter @panels/services add-route` | Scaffold new API route |
| Create database migration | `pnpm --filter @panels/services migration:create` | Create new migration |
| Run specific tests | `pnpm --filter @panels/app test panels` | Run targeted tests |
| Build for production | `pnpm build` | Build all applications |
| Type check all code | `pnpm typecheck` | Run TypeScript checks |

## Need Help?

- **[Troubleshooting](./troubleshooting/)** - Common issues and solutions
- **[FAQ](./faq.md)** - Frequently asked questions
- **[Community Support](./support.md)** - Getting help from the community 