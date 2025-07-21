# Foneflip Monorepo

A modern, scalable monorepo for building web applications with a focus on e-commerce, admin dashboards, and real-time features. Built with [Next.js](https://nextjs.org/), [shadcn/ui](https://ui.shadcn.com/), [TurboRepo](https://turbo.build/), and a modular package structure.

---

## Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Development](#development)
- [Packages](#packages)
- [Apps](#apps)
- [Authentication](#authentication)
- [Caching](#caching)
- [Database](#database)
- [Scripts](#scripts)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- **Monorepo**: Managed with TurboRepo for fast builds and efficient dependency management.
- **Component Library**: Uses shadcn/ui for reusable, customizable UI components.
- **Admin Dashboard**: Portal app for managing products, collections, orders, users, and vendors.
- **Authentication**: Pluggable auth with support for email/password, OTP, 2FA, and organizations.
- **Caching**: Multi-layer caching with Redis and Next.js for high performance.
- **Database**: PostgreSQL with Drizzle ORM and Zod validation.
- **Real-time**: WebSocket server for live updates.
- **Utilities**: Shared utility functions and types.
- **Dockerized**: Local development with Docker Compose for Postgres and Redis.

---

## Project Structure

```
apps/
  portal/         # Main admin dashboard (Next.js)
  ws-server/      # WebSocket server for real-time features
packages/
  auth/           # Authentication logic and providers
  db/             # Database schema and ORM
  queue/          # Queue management (BullMQ)
  redis/          # Redis client and helpers
  seo/            # SEO utilities and metadata
  ui/             # Shared UI components (shadcn/ui)
  utils/          # Shared utility functions
  validators/     # Zod schemas and validation
  docker/         # Docker Compose and related files
turbo/            # TurboRepo generators and templates
```

---

## Getting Started

### Prerequisites

- Node.js v20+
- [pnpm](https://pnpm.io/) v8+
- Docker (for local database/redis)

### Installation

```bash
git clone https://github.com/your-username/foneflip-repo.git
cd foneflip-repo
pnpm install
```

### Environment Setup

Copy `.env.example` to `.env` and fill in required values (database, auth secrets, etc).

### Start Docker Services

```bash
cd packages/docker
docker compose up -d
```

### Database Migrations

```bash
pnpm db:migrate
```

---

## Development

Start the main portal app:

```bash
pnpm dev
```

This runs all apps/packages in development mode using TurboRepo.

---

## Packages

- **@ziron/ui**: Shared UI components using shadcn/ui and Tailwind CSS.
- **@ziron/auth**: Authentication with support for organizations, 2FA, OTP, and role-based access.
- **@ziron/db**: Database schema and migrations using Drizzle ORM and PostgreSQL.
- **@ziron/queue**: Queue management with BullMQ.
- **@ziron/redis**: Redis client and helpers.
- **@ziron/seo**: SEO metadata utilities.
- **@ziron/utils**: Utility functions and constants.
- **@ziron/validators**: Zod schemas for validation.

---

## Apps

- **portal**: The main admin dashboard for managing products, collections, orders, users, and vendors. Built with Next.js and React.
- **ws-server**: WebSocket server for real-time features (e.g., live updates, notifications).

---

## Authentication

- Uses `@ziron/auth` with [Better Auth](https://github.com/your-org/better-auth).
- Supports email/password, OTP, 2FA, and organization-based roles (`user`, `vendor`, `admin`, `dev`).
- Session management with cookies and Redis for secondary storage.

---

## Caching

- Multi-layer caching for collections and other features:
  - **Redis**: Fast in-memory cache for frequently accessed data.
  - **Next.js**: Built-in cache with automatic revalidation.
- Cache keys and durations are standardized for consistency.
- Cache invalidation utilities provided for granular or global cache resets.

---

## Database

- PostgreSQL as the primary database.
- Managed with Drizzle ORM and Zod for schema validation.
- Migrations and studio available via package scripts.

---

## Scripts

Common scripts (run from the repo root):

- `pnpm dev` – Start all apps/packages in dev mode
- `pnpm build` – Build all apps/packages
- `pnpm lint` – Lint all code
- `pnpm db:migrate` – Run database migrations
- `pnpm db:studio` – Open Drizzle Studio for DB management
- `pnpm ui-add` – Add new UI components via shadcn/ui

---

## Contributing

1. Fork the repo and create your branch.
2. Make your changes and add tests where appropriate.
3. Run lint and type checks before committing.
4. Open a pull request and describe your changes.

---

## License

[MIT](LICENSE)

---

**For more details, see the README files in each package/app and the code comments.**
