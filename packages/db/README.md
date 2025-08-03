# Database Package

This package contains the database configuration, schema, and migrations for the FoneFlip application.

## Setup

### Prerequisites

1. Docker and Docker Compose installed
2. PostgreSQL database running (via Docker)

### Quick Start

1. **Start the database services:**
   ```bash
   pnpm docker:up
   ```

2. **Run database migrations:**
   ```bash
   pnpm db:migrate
   ```

3. **Open Drizzle Studio (optional):**
   ```bash
   pnpm db:studio
   ```

## Available Scripts

### Database Management
- `pnpm db:generate` - Generate new migration files
- `pnpm db:migrate` - Apply pending migrations
- `pnpm db:studio` - Open Drizzle Studio for database management
- `pnpm db:reset` - Reset database and re-run migrations

### Docker Services
- `pnpm docker:up` - Start all Docker services (PostgreSQL, Redis, RedisInsight)
- `pnpm docker:down` - Stop all Docker services
- `pnpm docker:reset-db` - Reset PostgreSQL database (removes all data)

## Troubleshooting

### Connection Refused Error
If you get `ECONNREFUSED` errors, make sure:
1. Docker is running
2. PostgreSQL container is started: `pnpm docker:up`
3. Database credentials in `.env` file are correct

### Migration Conflicts
If migrations fail due to existing objects:
1. Reset the database: `pnpm db:reset`
2. This will remove all data and re-apply migrations

### Database Reset
To completely reset the database:
```bash
pnpm db:reset
```

This will:
1. Stop the PostgreSQL container
2. Remove the database volume
3. Start a fresh PostgreSQL container
4. Apply all migrations

## Environment Variables

Required environment variables in `.env`:

> **Security Note**: Never commit `.env` files containing production credentials to version control. Use secure secret management solutions for production deployments.

- `DATABASE_URL` - PostgreSQL connection string
- `DB_HOST` - Database host (default: localhost)
- `DB_PORT` - Database port (default: 5432)
- `DB_USER` - Database user (default: postgres)
- `DB_PASSWORD` - Database password
- `DB_NAME` - Database name (default: foneflip)## Database Schema

The database schema is defined in `src/schema.ts` and includes:
- User management tables
- Authentication tables
- Application-specific tables

Migrations are stored in `src/migrations/` and are automatically applied when running `pnpm db:migrate`. 