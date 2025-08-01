# Worker App

This is a background worker application that handles scheduled and on-demand background tasks using BullMQ.

## Jobs

### Scheduled Jobs

The worker runs several scheduled jobs:

1. **Delete Old Notifications** (`deleteOldNotifications`)
   - Runs: Every 1st of the month at midnight
   - Purpose: Removes old notifications to keep the system clean

2. **Delete Soft-Deleted Notifications** (`deleteSoftDeletedNotifications`)
   - Runs: Every 1st of the month at 1:00 AM
   - Purpose: Permanently removes notifications that were soft-deleted over 30 days ago

3. **Delete Soft-Deleted Collections** (`deleteSoftDeletedCollections`)
   - Runs: Every day at 2:00 AM
   - Purpose: Permanently removes collections that were soft-deleted over 30 days ago
   - Notifies admin users when collections are permanently deleted

4. **Delete Soft-Deleted Products** (`deleteSoftDeletedProducts`)
   - Runs: Every day at 3:00 AM
   - Purpose: Permanently removes products that were soft-deleted over 30 days ago
   - Notifies admin users when products are permanently deleted

### On-Demand Jobs

1. **Notification** (`notification`)
   - Purpose: Sends notifications to users
   - Data: `{ userId: string, type: string, message: string }`

## Product Deletion Workflow

When a product is soft-deleted:

1. The `deleteProduct` action in the portal sets `deletedAt` to the current timestamp
2. All related caches are invalidated and revalidated
3. The product remains in the database but is filtered out of queries
4. After 30 days, the worker automatically permanently deletes the product
5. Admin users are notified of the permanent deletion
6. All related data (variants, attributes, images, etc.) is automatically cleaned up via database cascade

## Development

```bash
# Build the worker
pnpm build

# Run in development mode
pnpm dev

# Start the worker
pnpm start
```

## Configuration

The worker uses the following environment variables:
- Database connection (via `@ziron/db`)
- Redis connection (via `@ziron/redis`)
- Queue configuration (via `@ziron/queue`) 