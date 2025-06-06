# Environment File Generator

This script automatically generates `.env` files for your application based on the configuration in your `compose.yaml` file.

## Features

- ✅ **Extracts configuration** from Docker Compose services
- ✅ **Generates environment-specific** files (development, staging, production)
- ✅ **Creates backup files** before overwriting
- ✅ **Generates `.example` files** for version control
- ✅ **Supports multiple applications** (services, app, testing)

## Usage

```bash
# Generate development environment files (default)
pnpm generate:env

# Generate production environment files
pnpm generate:env:prod

# Generate staging environment files  
pnpm generate:env:staging

# Force overwrite existing files
pnpm generate:env -- --force
```

## Generated Files

The script creates the following files:

| File | Purpose |
|------|---------|
| `apps/services/.env` | Backend API configuration |
| `apps/app/.env.local` | Frontend application configuration |
| `.env.test` | Testing environment configuration |
| `*.example` | Template files safe to commit |

## Configuration Sources

### From compose.yaml
- **PostgreSQL**: Database credentials and connection details
- **Redis**: Cache server credentials and connection details  
- **Medplum**: Server URL and client configuration
- **Ports**: Service port mappings

### Environment-Specific Overrides
- **Development**: Local development settings
- **Staging**: Staging server configuration
- **Production**: Production-ready configuration with external services

## Example Output

```bash
🚀 Generating .env files for environment: development

📊 Extracted from compose.yaml:
   DATABASE_USER=medplum
   DATABASE_PASSWORD=medplum
   DATABASE_PORT=5432
   REDIS_PASSWORD=medplum
   REDIS_PORT=6379
   MEDPLUM_BASE_URL=http://localhost:8103

✅ Generated: apps/services/.env
   Backend services configuration

✅ Generated: apps/app/.env.local  
   Frontend application configuration

✅ Generated: .env.test
   Testing environment configuration

📝 Generating example files...
✅ Generated: apps/services/.env.example
✅ Generated: apps/app/.env.local.example
✅ Generated: .env.test.example

🎉 Environment file generation complete!
```

## Safety Features

- **Automatic backups**: Existing files are backed up with timestamps
- **Skip existing**: Won't overwrite files unless `--force` is used
- **Example files**: Creates `.example` files that are safe to commit

## Customization

You can modify the script to:
- Add new environment variables
- Support additional services
- Change file paths
- Add custom validation

## Integration with Development Workflow

1. **Setup**: `pnpm generate:env` 
2. **Start infrastructure**: `pnpm run:infra`
3. **Start development**: `pnpm dev`

The generated `.env` files will be automatically loaded by your applications. 