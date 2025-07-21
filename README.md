# Foneflip

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
- [Detailed Breakdown](#detailed-breakdown)
- [How to Use This Breakdown](#how-to-use-this-breakdown)

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
  worker/         # Background job processor (BullMQ)
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
- **worker**: Background job processor for scheduled and queued tasks (e.g., notifications, cleanup, data maintenance) using BullMQ and Redis.

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

## Detailed Breakdown

### Apps

#### 1. `apps/portal` (Admin Dashboard)

**Technical:**

- Built with Next.js and React.
- Provides a user interface for managing products, collections, orders, users, and vendors.
- Integrates with shared UI components (`@ziron/ui`), authentication (`@ziron/auth`), and data from the database (`@ziron/db`).
- Implements advanced features like caching (Redis + Next.js), role-based navigation, and real-time updates via WebSockets.
- Uses Tailwind CSS for styling and shadcn/ui for consistent UI patterns.

**Business:**

- The central hub for business operations.
- Enables admins and vendors to efficiently manage inventory, sales, and user accounts.
- Supports workflows like product onboarding, order tracking, and vendor management.
- Designed for scalability and ease of use, even for non-technical staff.

---

#### 2. `apps/ws-server` (WebSocket Server)

**Technical:**

- Node.js server using Express and Socket.IO.
- Handles real-time communication (e.g., live notifications, updates, chat).
- Connects to Redis for pub/sub and state management.
- Can be extended to support additional real-time features as the business grows.

**Business:**

- Powers live features in the admin dashboard and potentially customer-facing apps.
- Enables instant updates for orders, inventory changes, or support chat.
- Improves user engagement and operational responsiveness.

---

#### 3. `apps/worker` (Worker App)

**Technical:**

- Node.js background worker using BullMQ for job and queue management.
- Consumes jobs from a central queue (via Redis) and runs scheduled or on-demand background tasks.
- Handles jobs such as:
  - Sending and managing notifications (including live push via Redis pub/sub)
  - Soft- and hard-deleting old notifications and collections based on business rules
  - Scheduling recurring jobs (e.g., cleanup tasks) using cron-like patterns
- Integrates with `@ziron/db` for database access, `@ziron/queue` for job types, and `@ziron/validators` for data validation.
- Built and managed with TypeScript, tsup, and a shared lint/config setup.

**Business:**

- Automates critical maintenance and cleanup tasks (e.g., deleting old or soft-deleted data) to keep the system performant and compliant.
- Ensures admins are notified of important system events (like permanent deletion of collections).
- Reduces manual intervention and risk of data bloat or missed notifications.
- Frees up the main application for user-facing tasks by offloading heavy or scheduled work to a dedicated process.

---

### Packages

#### 1. `packages/ui` (`@ziron/ui`)

**Technical:**

- Shared React component library using shadcn/ui and Tailwind CSS.
- Houses reusable UI elements: buttons, forms, modals, sidebars, etc.
- Ensures design consistency across all apps.
- Easy to extend with new components as needed.

**Business:**

- Reduces development time by providing ready-to-use, branded UI components.
- Ensures a professional and cohesive look across all user interfaces.

---

#### 2. `packages/auth` (`@ziron/auth`)

**Technical:**

- Handles authentication and authorization logic.
- Supports email/password, OTP, 2FA, and organization-based roles.
- Integrates with Better Auth and uses Redis for session management.
- Exposes hooks and utilities for use in frontend apps.

**Business:**

- Secures the platform with modern authentication methods.
- Supports complex business roles (user, vendor, admin, dev) for granular access control.
- Enables features like vendor onboarding and multi-tenant access.

---

#### 3. `packages/db` (`@ziron/db`)

**Technical:**

- Database schema and ORM logic using Drizzle ORM and PostgreSQL.
- Contains migration scripts, schema definitions, and type-safe query utilities.
- Integrates with Zod for runtime validation.

**Business:**

- Centralizes all business data (products, users, orders, vendors, etc.).
- Ensures data integrity and supports business analytics and reporting.

---

#### 4. `packages/queue` (`@ziron/queue`)

**Technical:**

- Manages background jobs and task queues using BullMQ.
- Useful for tasks like sending emails, processing uploads, or syncing data.

**Business:**

- Improves performance and reliability by offloading heavy or time-consuming tasks.
- Enables scalable automation for business processes.

---

#### 5. `packages/redis` (`@ziron/redis`)

**Technical:**

- Provides a Redis client and helper utilities.
- Used for caching, session storage, and pub/sub messaging.

**Business:**

- Boosts performance by reducing database load.
- Enables real-time features and fast data access.

---

#### 6. `packages/seo` (`@ziron/seo`)

**Technical:**

- Utilities for generating SEO metadata.
- Ensures all pages have proper titles, descriptions, and Open Graph tags.

**Business:**

- Improves search engine visibility and social sharing.
- Helps drive organic traffic to the platform.

---

#### 7. `packages/utils` (`@ziron/utils`)

**Technical:**

- General-purpose utility functions and constants.
- Shared across all apps and packages.

**Business:**

- Reduces code duplication and improves maintainability.

---

#### 8. `packages/validators` (`@ziron/validators`)

**Technical:**

- Zod schemas for validating data structures.
- Used for form validation, API input validation, and database integrity.

**Business:**

- Prevents invalid data from entering the system.
- Reduces bugs and support issues.

---

#### 9. `packages/docker`

**Technical:**

- Docker Compose files for local development.
- Sets up Postgres, Redis, and RedisInsight for easy onboarding.

**Business:**

- Simplifies developer setup and ensures consistency across environments.
- Reduces onboarding time for new team members.

---

### turbo/ (TurboRepo Generators and Templates)

**Technical:**

- Contains code generators and templates for quickly scaffolding new packages.
- Ensures new code follows project conventions.

**Business:**

- Accelerates development and enforces best practices.

---

## How to Use This Breakdown

- **Developers:** Use this as a reference for where to add new features or fix bugs.
- **Product Managers:** Understand what each part of the system does and how it supports business goals.
- **Contributors:** Quickly get up to speed on the project’s structure and responsibilities.

---

**For more details, see the README files in each package/app and the code comments.**

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
