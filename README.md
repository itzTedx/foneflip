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
- **E-commerce Store**: Customer-facing store application with modern UI and features.
- **Authentication**: Pluggable auth with support for email/password, OTP, 2FA, and organizations.
- **Caching**: Multi-layer caching with Redis and Next.js for high performance.
- **Database**: PostgreSQL with Drizzle ORM and Zod validation.
- **Real-time**: WebSocket server for live updates and notifications.
- **Email System**: React-based email templates with preview and development tools.
- **API Layer**: Type-safe API layer using ORPC for client-server communication.
- **Utilities**: Shared utility functions and types.
- **Dockerized**: Local development with Docker Compose for Postgres and Redis.

---

## Project Structure

```
apps/
  portal/         # Main admin dashboard (Next.js)
  store/          # Customer-facing e-commerce store (Next.js)
  ws-server/      # WebSocket server for real-time features
  worker/         # Background job processor (BullMQ)
packages/
  api/            # Type-safe API layer (ORPC)
  auth/           # Authentication logic and providers
  db/             # Database schema and ORM
  email/          # Email templates and utilities
  queue/          # Queue management (BullMQ)
  redis/          # Redis client and helpers
  seo/            # SEO utilities and metadata
  ui/             # Shared UI components (shadcn/ui)
  utils/          # Shared utility functions
  validators/     # Zod schemas and validation
  docker/         # Docker Compose and related files
tooling/
  eslint/         # ESLint configuration
  biome/          # Biome configuration
  prettier/       # Prettier configuration
  typescript/     # TypeScript configuration
  github/         # GitHub workflows and templates
turbo/            # TurboRepo generators and templates
```

---

## Getting Started

### Prerequisites

- Node.js v20+
- [pnpm](https://pnpm.io/) v10.14.0+
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
pnpm docker:up
```

### Database Migrations

```bash
pnpm db:migrate
```

---

## Development

Start all applications in development mode:

```bash
pnpm dev
```

This runs all apps/packages in development mode using TurboRepo.

### Individual Apps

- **Portal (Admin Dashboard)**: `pnpm -F portal dev` (runs on port 3000)
- **Store (E-commerce)**: `pnpm -F store dev` (runs on port 3001)
- **Email Development**: `pnpm dev:email` (runs on port 3333)

---

## Packages

- **@ziron/api**: Type-safe API layer using ORPC for client-server communication.
- **@ziron/ui**: Shared UI components using shadcn/ui and Tailwind CSS.
- **@ziron/auth**: Authentication with support for organizations, 2FA, OTP, and role-based access.
- **@ziron/db**: Database schema and migrations using Drizzle ORM and PostgreSQL.
- **@ziron/email**: React-based email templates with development and preview tools.
- **@ziron/queue**: Queue management with BullMQ.
- **@ziron/redis**: Redis client and helpers.
- **@ziron/seo**: SEO metadata utilities.
- **@ziron/utils**: Utility functions and constants.
- **@ziron/validators**: Zod schemas for validation.

---

## Apps

- **portal**: The main admin dashboard for managing products, collections, orders, users, and vendors. Built with Next.js and React.
- **store**: Customer-facing e-commerce store with modern UI, product browsing, and checkout functionality.
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
- `pnpm format` – Format all code
- `pnpm db:migrate` – Run database migrations
- `pnpm db:studio` – Open Drizzle Studio for DB management
- `pnpm db:reset` – Reset database and run migrations
- `pnpm ui-add` – Add new UI components via shadcn/ui
- `pnpm dev:email` – Start email development server
- `pnpm docker:up` – Start Docker services
- `pnpm docker:down` – Stop Docker services

---

## Detailed Breakdown

### Apps

#### 1. `apps/portal` (Admin Dashboard)

**Technical:**

- Built with Next.js 15 and React 19.
- Provides a user interface for managing products, collections, orders, users, and vendors.
- Integrates with shared UI components (`@ziron/ui`), authentication (`@ziron/auth`), and data from the database (`@ziron/db`).
- Implements advanced features like caching (Redis + Next.js), role-based navigation, and real-time updates via WebSockets.
- Uses Tailwind CSS for styling and shadcn/ui for consistent UI patterns.
- Features drag-and-drop functionality with `@dnd-kit`, rich text editing with TipTap, and file management with AWS S3.

**Business:**

- The central hub for business operations.
- Enables admins and vendors to efficiently manage inventory, sales, and user accounts.
- Supports workflows like product onboarding, order tracking, and vendor management.
- Designed for scalability and ease of use, even for non-technical staff.

---

#### 2. `apps/store` (E-commerce Store)

**Technical:**

- Built with Next.js 15 and React 19.
- Customer-facing e-commerce application with modern UI and features.
- Integrates with the API layer (`@ziron/api`) for type-safe data fetching.
- Uses shared UI components and authentication system.
- Implements SEO optimization and performance best practices.

**Business:**

- Provides customers with a seamless shopping experience.
- Features product browsing, search, and checkout functionality.
- Integrates with the admin dashboard for inventory and order management.

---

#### 3. `apps/ws-server` (WebSocket Server)

**Technical:**

- Node.js server using Express and Socket.IO.
- Handles real-time communication (e.g., live notifications, updates, chat).
- Connects to Redis for pub/sub and state management.
- Can be extended to support additional real-time features as the business grows.

**Business:**

- Powers live features in the admin dashboard and customer-facing apps.
- Enables instant updates for orders, inventory changes, or support chat.
- Improves user engagement and operational responsiveness.

---

#### 4. `apps/worker` (Worker App)

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

#### 1. `packages/api` (`@ziron/api`)

**Technical:**

- Type-safe API layer using ORPC (Object Remote Procedure Call).
- Provides end-to-end type safety between client and server.
- Integrates with TanStack Query for efficient data fetching and caching.
- Exports API types and utilities for use across applications.

**Business:**

- Ensures data consistency and type safety across the entire application.
- Reduces API-related bugs and improves developer experience.
- Enables efficient data fetching and caching strategies.

---

#### 2. `packages/email` (`@ziron/email`)

**Technical:**

- React-based email template system using React Email.
- Provides development server for email preview and testing.
- Supports multiple email templates with TypeScript validation.
- Integrates with nodemailer for email delivery.

**Business:**

- Ensures consistent, branded email communications.
- Enables rapid email template development and testing.
- Supports transactional emails, notifications, and marketing communications.

---

#### 3. `packages/ui` (`@ziron/ui`)

**Technical:**

- Shared React component library using shadcn/ui and Tailwind CSS.
- Houses reusable UI elements: buttons, forms, modals, sidebars, etc.
- Ensures design consistency across all apps.
- Easy to extend with new components as needed.

**Business:**

- Reduces development time by providing ready-to-use, branded UI components.
- Ensures a professional and cohesive look across all user interfaces.

---

#### 4. `packages/auth` (`@ziron/auth`)

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

#### 5. `packages/db` (`@ziron/db`)

**Technical:**

- Database schema and ORM logic using Drizzle ORM and PostgreSQL.
- Contains migration scripts, schema definitions, and type-safe query utilities.
- Integrates with Zod for runtime validation.

**Business:**

- Centralizes all business data (products, users, orders, vendors, etc.).
- Ensures data integrity and supports business analytics and reporting.

---

#### 6. `packages/queue` (`@ziron/queue`)

**Technical:**

- Manages background jobs and task queues using BullMQ.
- Useful for tasks like sending emails, processing uploads, or syncing data.

**Business:**

- Improves performance and reliability by offloading heavy or time-consuming tasks.
- Enables scalable automation for business processes.

---

#### 7. `packages/redis` (`@ziron/redis`)

**Technical:**

- Provides a Redis client and helper utilities.
- Used for caching, session storage, and pub/sub messaging.

**Business:**

- Boosts performance by reducing database load.
- Enables real-time features and fast data access.

---

#### 8. `packages/seo` (`@ziron/seo`)

**Technical:**

- Utilities for generating SEO metadata.
- Ensures all pages have proper titles, descriptions, and Open Graph tags.

**Business:**

- Improves search engine visibility and social sharing.
- Helps drive organic traffic to the platform.

---

#### 9. `packages/utils` (`@ziron/utils`)

**Technical:**

- General-purpose utility functions and constants.
- Shared across all apps and packages.

**Business:**

- Reduces code duplication and improves maintainability.

---

#### 10. `packages/validators` (`@ziron/validators`)

**Technical:**

- Zod schemas for validating data structures.
- Used for form validation, API input validation, and database integrity.

**Business:**

- Prevents invalid data from entering the system.
- Reduces bugs and support issues.

---

#### 11. `packages/docker`

**Technical:**

- Docker Compose files for local development.
- Sets up Postgres, Redis, and RedisInsight for easy onboarding.

**Business:**

- Simplifies developer setup and ensures consistency across environments.
- Reduces onboarding time for new team members.

---

### tooling/ (Development Tools)

**Technical:**

- **eslint/**: ESLint configuration for code linting.
- **biome/**: Biome configuration for formatting and linting.
- **prettier/**: Prettier configuration for code formatting.
- **typescript/**: TypeScript configuration and shared types.
- **github/**: GitHub workflows and templates for CI/CD.

**Business:**

- Ensures code quality and consistency across the team.
- Automates development workflows and reduces manual tasks.

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
- **Contributors:** Quickly get up to speed on the project's structure and responsibilities.

---

**For more details, see the README files in each package/app and the code comments.**



