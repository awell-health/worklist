# Worklist Project

This project is built using Next.js and Medplum, providing a healthcare-focused application with a modern tech stack.

## Tech Stack

- **Frontend**: Next.js
- **Backend**: Medplum Server
- **Database**: PostgreSQL 16
- **Cache**: Redis 7
- **Package Manager**: pnpm
- **Node Version**: 22.14.0
- **Code Quality**: Biome (formatter and linter)

## Prerequisites

- Node.js >= 22
- pnpm >= 10.11.0
- Docker and Docker Compose
- PostgreSQL 16 (if running locally)
- Redis 7 (if running locally)

## Project Structure

```
.
├── apps/              # Application packages
├── packages/          # Shared packages
├── dev/              # Development configuration
│   ├── config/       # Configuration files
│   └── datastore/    # Local database storage
└── compose.yaml      # Docker Compose configuration
```

## Getting Started

1. **Install Dependencies**
   ```bash
   pnpm bootstrap
   ```

2. **Start Development Environment**
   ```bash
   # Start the infrastructure (PostgreSQL, Redis, Medplum)
   pnpm run:infra

   # Start the development server
   pnpm dev
   ```

3. **Access the Applications**
   - Frontend: http://localhost:3003
   - Medplum Server: http://localhost:8103
   - Database UI (pgweb): http://localhost:8081

## Configuration

### Medplum Configuration

The project uses Medplum for healthcare data management. Configuration can be done through:

1. Environment variables (prefixed with `MEDPLUM_`)
2. Configuration file at `dev/config/medplum.config.json`

Key configuration parameters include:
- Server settings (port, base URLs)
- Database connection
- Redis connection
- Security settings
- Bot configuration
- Initial admin setup

### Development Tools

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

## Available Scripts

- `pnpm dev`: Start development server
- `pnpm build`: Build the project
- `pnpm clean`: Clean build artifacts
- `pnpm clean:all`: Clean all artifacts including datastore
- `pnpm run:infra`: Start infrastructure services
- `pnpm run:infra:stop`: Stop infrastructure services
- `pnpm format`: Check code formatting
- `pnpm format:fix`: Fix code formatting
- `pnpm lint`: Run linter
- `pnpm lint:fix`: Fix linting issues
- `pnpm typecheck`: Run TypeScript type checking

## Infrastructure

The project uses Docker Compose to manage the following services:

- **PostgreSQL**: Database server
  - Port: 5432
  - Default credentials: medplum/medplum

- **Redis**: Cache server
  - Port: 6379
  - Password: medplum

- **Medplum Server**: Healthcare data server
  - Port: 8103
  - Configuration: See Medplum Configuration section

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
