# Installation

This guide will help you set up the Awell Panels development environment on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js 22+** - [Download from nodejs.org](https://nodejs.org/)
- **pnpm 10.11+** - Package manager for the monorepo
- **Docker & Docker Compose** - For running infrastructure services
- **Git** - For version control

### Verify Prerequisites

\`\`\`bash
# Check Node.js version
node --version  # Should be 22.x.x or higher

# Check pnpm version  
pnpm --version  # Should be 10.11.x or higher

# Check Docker
docker --version
docker compose version
\`\`\`

## Clone the Repository

\`\`\`bash
git clone <repository-url>
cd worklist
\`\`\`

## Install Dependencies

The project uses pnpm workspaces to manage dependencies across the monorepo:

\`\`\`bash
# Install all dependencies for all packages
pnpm bootstrap
\`\`\`

This command will:
- Install dependencies for all packages in the monorepo
- Set up workspace linking between packages
- Prepare development tools

## Environment Setup

### 1. Copy Environment Files

\`\`\`bash
# Copy environment template for services
cp apps/services/.env.example apps/services/.env

# Copy environment template for app (if needed)
cp apps/app/.env.example apps/app/.env
\`\`\`

### 2. Configure Environment Variables

Edit `apps/services/.env` with your local settings:

\`\`\`bash
# Database Configuration
DATABASE_URL=postgresql://medplum:medplum@localhost:5432/medplum
REDIS_URL=redis://localhost:6379

# Server Configuration
PORT=3001
NODE_ENV=development

# JWT Configuration (generate a secure secret)
JWT_SECRET=your-secure-jwt-secret-key

# Tenant Configuration (for development)
DEFAULT_TENANT_ID=tenant-123
DEFAULT_USER_ID=user-456
\`\`\`

## Start Infrastructure Services

The project includes Docker Compose configuration for all required infrastructure:

\`\`\`bash
# Start PostgreSQL, Redis, and pgweb
pnpm run:infra
\`\`\`

This starts:
- **PostgreSQL 16** on port 5432
- **Redis 7** on port 6379  
- **pgweb** (database UI) on port 8081

### Verify Infrastructure

\`\`\`bash
# Check that services are running
docker compose ps

# Should show services: postgresql, redis, pgweb
\`\`\`

Access pgweb at http://localhost:8081 to verify database connectivity.

## Database Setup

### Run Migrations

\`\`\`bash
# Navigate to services directory
cd apps/services

# Run database migrations
pnpm migration:apply

# Or reset database with fresh schema (development only)
pnpm schema:fresh
\`\`\`

### Verify Database

\`\`\`bash
# Check database connection
pnpm typecheck

# Run a quick test
pnpm test
\`\`\`

## Start Development Servers

### Option 1: Start All Services

\`\`\`bash
# From project root - starts both frontend and backend
pnpm dev
\`\`\`

### Option 2: Start Services Individually

\`\`\`bash
# Terminal 1 - Backend API
cd apps/services
pnpm dev

# Terminal 2 - Frontend App
cd apps/app  
pnpm dev
\`\`\`

## Verify Installation

### Check Running Services

After starting the development servers, verify everything is working:

- **Frontend**: http://localhost:3003
- **Backend API**: http://localhost:3001
- **API Documentation**: http://localhost:3001/docs
- **Database UI**: http://localhost:8081

### Test API Client

Create a test file to verify the API client works:

\`\`\`typescript
// test-api.ts
import { panelsAPI } from '@panels/app/api'

async function testAPI() {
  try {
    const panels = await panelsAPI.all("tenant-123", "user-456")
    console.log("API working! Found panels:", panels.length)
  } catch (error) {
    console.error("API error:", error)
  }
}

testAPI()
\`\`\`

## Development Tools

### Code Quality Tools

\`\`\`bash
# Check code formatting
pnpm format

# Fix formatting issues
pnpm format:fix

# Run linter
pnpm lint

# Fix linting issues  
pnpm lint:fix

# Type checking
pnpm typecheck
\`\`\`

### Testing

\`\`\`bash
# Run all tests
pnpm test

# Run tests with coverage
pnpm --filter @panels/services test:coverage

# Run specific test file
pnpm --filter @panels/services test panel.test.ts
\`\`\`

## Troubleshooting

### Common Issues

**Port conflicts:**
\`\`\`bash
# If ports are already in use, stop conflicting services
sudo lsof -i :3001  # Check what's using port 3001
sudo lsof -i :5432  # Check what's using PostgreSQL port
\`\`\`

**Database connection issues:**
\`\`\`bash
# Reset infrastructure
pnpm run:infra:stop
pnpm run:infra

# Reset database
cd apps/services
pnpm schema:fresh
\`\`\`

**Dependency issues:**
\`\`\`bash
# Clean and reinstall
pnpm clean
pnpm bootstrap
\`\`\`

**Build issues:**
\`\`\`bash
# Clean build artifacts
pnpm clean:all
pnpm bootstrap
pnpm build
\`\`\`

### Environment Variables

If you're having issues, verify your environment variables:

\`\`\`bash
# In apps/services directory
cat .env

# Should contain valid DATABASE_URL, REDIS_URL, etc.
\`\`\`

### Docker Issues

\`\`\`bash
# Reset Docker environment
docker compose down -v
docker compose up -d

# Check Docker logs
docker compose logs postgresql
docker compose logs redis
\`\`\`

## Next Steps

Now that your environment is set up, you're ready to create your first panel!

[Next: Your First Panel →](./first-panel)
